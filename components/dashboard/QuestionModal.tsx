'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, Image as ImageIcon, HelpCircle, Check, AlertCircle, ListOrdered, CheckSquare2, Edit3, Sparkles } from 'lucide-react'
import type { Question, Category, Difficulty, QuestionType, QuestionFormData } from '@/types'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: QuestionFormData, questionId?: string) => Promise<{ success?: boolean; error?: string }>
  categories: Category[]
  questionToEdit?: Question | null
}

export default function QuestionModal({
  isOpen,
  onClose,
  onSave,
  categories,
  questionToEdit,
}: QuestionModalProps) {
  const [questionText, setQuestionText] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('basic')
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
  const [explanation, setExplanation] = useState('')
  const [points, setPoints] = useState(10)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [options, setOptions] = useState<
    { option_text: string; is_correct: boolean; order_index: number }[]
  >([
    { option_text: '', is_correct: true, order_index: 0 },
    { option_text: '', is_correct: false, order_index: 1 },
    { option_text: '', is_correct: false, order_index: 2 },
    { option_text: '', is_correct: false, order_index: 3 },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (questionToEdit) {
      setQuestionText(questionToEdit.question_text || '')
      setCategoryId(questionToEdit.category_id || (categories[0]?.id ?? ''))
      setDifficulty(questionToEdit.difficulty || 'basic')
      const qType = questionToEdit.question_type || 'multiple_choice'
      setQuestionType(qType)
      setExplanation(questionToEdit.explanation || '')
      setPoints(questionToEdit.points || 10)
      setImageUrl(questionToEdit.image_url || '')
      setImageCaption(questionToEdit.image_caption || '')
      setIsActive(questionToEdit.is_active ?? true)

      if (questionToEdit.options && questionToEdit.options.length > 0) {
        setOptions(
          questionToEdit.options.map((opt, idx) => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order_index: opt.order_index ?? idx,
          }))
        )
      }
    } else {
      setQuestionText('')
      setCategoryId(categories[0]?.id || '')
      setDifficulty('basic')
      setQuestionType('multiple_choice')
      setExplanation('')
      setPoints(10)
      setImageUrl('')
      setImageCaption('')
      setIsActive(true)
      setOptions([
        { option_text: '', is_correct: true, order_index: 0 },
        { option_text: '', is_correct: false, order_index: 1 },
        { option_text: '', is_correct: false, order_index: 2 },
        { option_text: '', is_correct: false, order_index: 3 },
      ])
    }
    setError(null)
  }, [questionToEdit, categories, isOpen])

  if (!isOpen) return null

  // Manejar cambio de tipo de pregunta
  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType)
    setError(null)

    if (newType === 'true_false') {
      // Opciones fijas para verdadero y falso
      setOptions([
        { option_text: 'Verdadero', is_correct: true, order_index: 0 },
        { option_text: 'Falso', is_correct: false, order_index: 1 },
      ])
    } else if (newType === 'fill_in_the_blank') {
      // Si cambia a completa y no tiene plantilla de opciones
      if (options.length === 2 && (options[0].option_text === 'Verdadero' || options[0].option_text === 'Falso')) {
        setOptions([
          { option_text: '', is_correct: true, order_index: 0 },
          { option_text: '', is_correct: false, order_index: 1 },
          { option_text: '', is_correct: false, order_index: 2 },
          { option_text: '', is_correct: false, order_index: 3 },
        ])
      }
    } else if (newType === 'multiple_choice') {
      if (options.length === 2 && (options[0].option_text === 'Verdadero' || options[0].option_text === 'Falso')) {
        setOptions([
          { option_text: '', is_correct: true, order_index: 0 },
          { option_text: '', is_correct: false, order_index: 1 },
          { option_text: '', is_correct: false, order_index: 2 },
          { option_text: '', is_correct: false, order_index: 3 },
        ])
      }
    }
  }

  // Insertar marcador de espacio en blanco [_____] en el texto de la pregunta
  const handleInsertBlankSlot = () => {
    const blankTag = ' [_____] '
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = questionText
      const newText = text.substring(0, start) + blankTag + text.substring(end)
      setQuestionText(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + blankTag.length, start + blankTag.length)
      }, 0)
    } else {
      setQuestionText(prev => prev + blankTag)
    }
  }

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, option_text: text } : opt))
  }

  const handleSelectCorrect = (index: number) => {
    setOptions(prev => prev.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    })))
  }

  const handleAddOption = () => {
    if (options.length >= 6) return
    setOptions(prev => [
      ...prev,
      { option_text: '', is_correct: false, order_index: prev.length },
    ])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return
    const newOpts = options.filter((_, i) => i !== index)
    if (!newOpts.some(o => o.is_correct) && newOpts.length > 0) {
      newOpts[0].is_correct = true
    }
    setOptions(newOpts.map((o, idx) => ({ ...o, order_index: idx })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!questionText.trim()) {
      setError('Por favor redacta el título o enunciado de la pregunta.')
      return
    }

    if (!categoryId) {
      setError('Por favor selecciona una categoría.')
      return
    }

    if (questionType === 'fill_in_the_blank' && !questionText.includes('[_____]') && !questionText.includes('_____') && !questionText.includes('___')) {
      // Advertencia útil pero no bloqueante, o auto-asistir
    }

    const filledOptions = options.filter(o => o.option_text.trim().length > 0)
    if (filledOptions.length < 2) {
      setError('Debes agregar al menos 2 opciones de respuesta.')
      return
    }

    if (!filledOptions.some(o => o.is_correct)) {
      setError('Debes marcar cuál es la respuesta correcta.')
      return
    }

    setLoading(true)
    try {
      const data: QuestionFormData = {
        question_text: questionText.trim(),
        category_id: categoryId,
        difficulty,
        question_type: questionType,
        explanation: explanation.trim() || 'Sin justificación adicional.',
        points: Number(points) || 10,
        image_url: imageUrl.trim() || undefined,
        image_caption: imageCaption.trim() || undefined,
        is_active: isActive,
        options: filledOptions,
      }

      const res = await onSave(data, questionToEdit?.id)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando la pregunta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111214] border border-brand-border rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-[#16191e]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-brand-accent" size={22} />
              {questionToEdit ? 'Editar Pregunta Médica' : 'Crear Nueva Pregunta para Examen'}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Configura el título, modalidad de evaluación y opciones de respuesta
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-white p-2 rounded-lg hover:bg-brand-gray transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 bg-brand-error/10 border border-brand-error text-brand-error rounded-xl text-sm flex items-center gap-2 animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Selector de Modalidad (3 Opciones) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
              Modalidad de la Pregunta *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opción 1: Selección Múltiple */}
              <button
                type="button"
                onClick={() => handleTypeChange('multiple_choice')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  questionType === 'multiple_choice'
                    ? 'bg-brand-accent/15 border-brand-accent text-white shadow-[0_0_15px_rgba(242,196,0,0.2)]'
                    : 'bg-[#16191e] border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                }`}
              >
                <div className={`p-2 rounded-lg ${questionType === 'multiple_choice' ? 'bg-brand-accent text-brand-dark' : 'bg-[#1a1d21] text-brand-muted'}`}>
                  <ListOrdered size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Selección Múltiple</p>
                  <p className="text-[11px] text-brand-muted">Opciones A, B, C, D</p>
                </div>
              </button>

              {/* Opción 2: Falso y Verdadero */}
              <button
                type="button"
                onClick={() => handleTypeChange('true_false')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  questionType === 'true_false'
                    ? 'bg-blue-500/15 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-[#16191e] border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                }`}
              >
                <div className={`p-2 rounded-lg ${questionType === 'true_false' ? 'bg-blue-500 text-white' : 'bg-[#1a1d21] text-brand-muted'}`}>
                  <CheckSquare2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Falso y Verdadero</p>
                  <p className="text-[11px] text-brand-muted">Declaración binaria</p>
                </div>
              </button>

              {/* Opción 3: Completa */}
              <button
                type="button"
                onClick={() => handleTypeChange('fill_in_the_blank')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  questionType === 'fill_in_the_blank'
                    ? 'bg-purple-500/15 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-[#16191e] border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                }`}
              >
                <div className={`p-2 rounded-lg ${questionType === 'fill_in_the_blank' ? 'bg-purple-500 text-white' : 'bg-[#1a1d21] text-brand-muted'}`}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Completa</p>
                  <p className="text-[11px] text-brand-muted">Rellenar espacio en blanco</p>
                </div>
              </button>
            </div>
          </div>

          {/* Título / Enunciado de la Pregunta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white block">
                {questionType === 'fill_in_the_blank'
                  ? 'Enunciado de la Frase a Completar *'
                  : questionType === 'true_false'
                  ? 'Afirmación / Título de la Pregunta *'
                  : 'Título / Enunciado de la Pregunta *'}
              </label>

              {questionType === 'fill_in_the_blank' && (
                <button
                  type="button"
                  onClick={handleInsertBlankSlot}
                  className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={13} /> Insertar espacio [_____]
                </button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              required
              rows={questionType === 'fill_in_the_blank' ? 3 : 3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={
                questionType === 'fill_in_the_blank'
                  ? 'Ej. La unidad de medida de atenuación en Tomografía Computarizada se denomina [_____].'
                  : questionType === 'true_false'
                  ? 'Ej. En una radiografía de tórax PA estándar, las clavículas deben proyectarse sobre los campos pulmonares superiores.'
                  : 'Ej. ¿Cuál es el hallazgo radiológico característico del neumotórax a tensión en una radiografía de tórax PA?'
              }
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted resize-none leading-relaxed"
            />

            {questionType === 'fill_in_the_blank' && (
              <p className="text-xs text-brand-muted">
                💡 Consejo: Escribe el texto de la pregunta e inserta <code className="text-purple-300 bg-purple-950/50 px-1 py-0.5 rounded border border-purple-800/40">[_____]</code> donde debe ir la palabra o frase a completar.
              </p>
            )}
          </div>

          {/* Categoría, Dificultad y Puntos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase">Categoría / Materia *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-accent"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-accent"
              >
                <option value="basic">Básico</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase">Puntos</label>
              <input
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          {/* Imagen Radiológica Opcional */}
          <div className="p-4 bg-[#16191e] border border-brand-border/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ImageIcon size={18} className="text-brand-accent" />
              <span>Imagen Radiológica / Estudio Clínico (Opcional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="url"
                placeholder="URL de la imagen (ej. https://... o /hero-character.jpg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
              <input
                type="text"
                placeholder="Pie de imagen / Descripción del estudio"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* OPCIONES DE RESPUESTA SEGÚN MODALIDAD */}
          {/* ============================================================ */}

          {/* Modalidad 1: Falso y Verdadero */}
          {questionType === 'true_false' && (
            <div className="space-y-3 p-4 bg-[#16191e] border border-blue-500/20 rounded-xl">
              <label className="text-sm font-bold text-white block">
                Respuesta Correcta de la Afirmación *
              </label>
              <p className="text-xs text-brand-muted">
                Selecciona si la afirmación planteada es Verdadera o Falsa:
              </p>

              <div className="grid grid-cols-2 gap-4 pt-1">
                {options.slice(0, 2).map((opt, idx) => {
                  const isTrue = opt.option_text.toLowerCase() === 'verdadero'
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCorrect(idx)}
                      className={`p-4 rounded-xl border-2 text-center font-bold text-base transition-all flex flex-col items-center justify-center gap-2 ${
                        opt.is_correct
                          ? isTrue
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          : 'bg-[#1a1d21] border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        opt.is_correct ? (isTrue ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white') : 'bg-[#111214] text-brand-muted'
                      }`}>
                        {opt.is_correct ? <Check size={18} strokeWidth={3} /> : null}
                      </div>
                      <span>{opt.option_text}</span>
                      <span className="text-[11px] font-normal opacity-80">
                        {opt.is_correct ? '(Respuesta Correcta)' : 'Marcar como correcta'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Modalidad 2: Selección Múltiple y Modalidad 3: Completa */}
          {questionType !== 'true_false' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-white block">
                  {questionType === 'fill_in_the_blank'
                    ? 'Opciones de Completación (Marca la palabra/frase correcta) *'
                    : 'Opciones de Respuesta (Marca el círculo de la correcta) *'}
                </label>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-brand-accent font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Añadir opción
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      opt.is_correct
                        ? questionType === 'fill_in_the_blank'
                          ? 'bg-purple-500/15 border-purple-400'
                          : 'bg-brand-accent/10 border-brand-accent/50'
                        : 'bg-[#1a1d21] border-brand-border'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCorrect(idx)}
                      title={opt.is_correct ? 'Opción Correcta' : 'Marcar como correcta'}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        opt.is_correct
                          ? questionType === 'fill_in_the_blank'
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'bg-brand-accent border-brand-accent text-brand-dark'
                          : 'border-brand-muted hover:border-brand-accent'
                      }`}
                    >
                      {opt.is_correct && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold text-brand-muted w-5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={
                          opt.is_correct
                            ? questionType === 'fill_in_the_blank'
                              ? 'Ingresa el término o valor exacto que completa la frase (Correcto)...'
                              : 'Ingresa la respuesta correcta...'
                            : questionType === 'fill_in_the_blank'
                            ? `Término distractor ${String.fromCharCode(65 + idx)}...`
                            : `Opción ${String.fromCharCode(65 + idx)}...`
                        }
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-brand-muted"
                      />
                    </div>

                    {opt.is_correct && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        questionType === 'fill_in_the_blank'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-brand-accent/20 text-brand-accent'
                      }`}>
                        Correcta
                      </span>
                    )}

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-brand-muted hover:text-brand-error p-1 rounded transition-colors"
                        title="Eliminar opción"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicación médica */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white block flex items-center gap-1.5">
              <HelpCircle size={16} className="text-brand-accent" />
              Explicación Médica y Justificación
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explica por qué esta es la respuesta correcta para que el estudiante aprenda y repase tras la evaluación..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted resize-none"
            />
          </div>

          {/* Footer del Formulario */}
          <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-white transition-colors text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-accent text-brand-dark hover:bg-brand-accent-light transition-all text-sm font-bold shadow-[0_0_15px_rgba(242,196,0,0.3)] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : questionToEdit ? 'Actualizar Pregunta' : 'Guardar Pregunta en el Banco'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

