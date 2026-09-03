'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Clock, Award, AlertCircle } from 'lucide-react'
import type { Exam, Category, Difficulty } from '@/types'

interface CategoryWithCount extends Category {
  questions_count?: number
}

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FormData, examId?: string) => Promise<{ success?: boolean; error?: string }>
  categories: CategoryWithCount[]
  examToEdit?: any | null
}

export default function ExamModal({
  isOpen,
  onClose,
  onSave,
  categories,
  examToEdit,
}: ExamModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20)
  const [passingScore, setPassingScore] = useState(70)
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (examToEdit) {
      setTitle(examToEdit.title || '')
      setDescription(examToEdit.description || '')
      setCategoryId(examToEdit.category_id || (categories[0]?.id ?? ''))
      setQuestionCount(examToEdit.question_count || 10)
      setTimeLimitMinutes(examToEdit.time_limit_minutes || 20)
      setPassingScore(examToEdit.passing_score || 70)
      setDifficulty(examToEdit.difficulty || 'intermediate')
      setIsPublished(examToEdit.is_published ?? false)
    } else {
      setTitle('')
      setDescription('')
      setCategoryId(categories[0]?.id || '')
      setQuestionCount(10)
      setTimeLimitMinutes(20)
      setPassingScore(70)
      setDifficulty('intermediate')
      setIsPublished(false)
    }
    setError(null)
  }, [examToEdit, categories, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Por favor ingresa un título para el examen.')
      return
    }

    if (!categoryId) {
      setError('Por favor selecciona una categoría.')
      return
    }

    const selectedCategory = categories.find(c => c.id === categoryId)
    const availableQuestions = selectedCategory?.questions_count || 0

    if (questionCount > availableQuestions) {
      setError(`No puedes solicitar ${questionCount} preguntas. Solo hay ${availableQuestions} preguntas disponibles en el banco para esta categoría.`)
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title.trim())
      fd.append('description', description.trim())
      fd.append('category_id', categoryId)
      fd.append('question_count', String(questionCount))
      fd.append('time_limit_minutes', String(timeLimitMinutes))
      fd.append('passing_score', String(passingScore))
      fd.append('difficulty', difficulty)
      fd.append('is_published', String(isPublished))

      const res = await onSave(fd, examToEdit?.id)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando el examen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111214] border border-brand-border rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-[#16191e]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-brand-accent" size={22} />
              {examToEdit ? 'Editar Examen / Evaluación' : 'Crear Nuevo Examen'}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Configura los parámetros de evaluación médica para los alumnos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-white p-2 rounded-lg hover:bg-brand-gray transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-4 bg-brand-error/10 border border-brand-error text-brand-error rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Título de la Evaluación *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Evaluación Integral: Radiología Torácica y Cardiovascular"
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Descripción / Instrucciones</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instrucciones para el estudiante antes de iniciar la prueba..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl p-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted resize-none"
            />
          </div>

          {/* Categoría y Dificultad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase">Categoría *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-accent"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.questions_count || 0} preg. disponibles)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase">Nivel de Dificultad</label>
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
          </div>

          {/* Métricas: Cantidad de preguntas, tiempo, puntaje mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl space-y-1">
              <label className="text-[11px] font-bold text-brand-muted uppercase flex items-center justify-between gap-1">
                <div className="flex items-center gap-1"><BookOpen size={14} className="text-brand-accent" /> Preguntas</div>
                <span className="text-[9px] text-white/40 font-normal">Máx: {categories.find(c => c.id === categoryId)?.questions_count || 0}</span>
              </label>
              <input
                type="number"
                min={1}
                max={categories.find(c => c.id === categoryId)?.questions_count || 100}
                required
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-3 py-1.5 text-white text-sm font-bold focus:outline-none focus:border-brand-accent"
              />
              {(categories.find(c => c.id === categoryId)?.questions_count || 0) === 0 && (
                 <p className="text-[10px] text-brand-error/80 mt-1 leading-tight">
                   Debes añadir preguntas al banco para esta categoría.
                 </p>
              )}
            </div>

            <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl space-y-1">
              <label className="text-[11px] font-bold text-brand-muted uppercase flex items-center gap-1">
                <Clock size={14} className="text-blue-400" /> Tiempo (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                required
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-3 py-1.5 text-white text-sm font-bold focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="p-3 bg-[#16191e] border border-brand-border rounded-xl space-y-1">
              <label className="text-[11px] font-bold text-brand-muted uppercase flex items-center gap-1">
                <Award size={14} className="text-green-400" /> % Aprobación
              </label>
              <input
                type="number"
                min={50}
                max={100}
                required
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-3 py-1.5 text-white text-sm font-bold focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          {/* Opción de Publicar Inmediatamente */}
          <div className="p-4 bg-[#16191e] border border-brand-border/80 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white">Publicar Evaluación para Estudiantes</p>
              <p className="text-xs text-brand-muted">
                Al activar esta opción, el examen se publicará de inmediato y todos los estudiantes recibirán una notificación.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1a1d21] border border-brand-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-checked:border-green-400"></div>
            </label>
          </div>

          {/* Footer */}
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
              {loading ? 'Guardando...' : examToEdit ? 'Actualizar Examen' : isPublished ? 'Crear y Publicar Examen' : 'Guardar como Borrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
