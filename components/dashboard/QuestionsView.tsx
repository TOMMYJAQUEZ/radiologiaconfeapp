'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Search, FileText, Filter, CheckCircle2, AlertCircle, HelpCircle, ListOrdered, CheckSquare2, Edit3, Sparkles } from 'lucide-react'
import { createQuestion, updateQuestion, deleteQuestion } from '@/actions/teacher'
import QuestionModal from '@/components/dashboard/QuestionModal'
import type { Question, Category, QuestionFormData, QuestionType } from '@/types'

interface QuestionsViewProps {
  initialQuestions: Question[]
  categories: Category[]
}

export default function QuestionsView({ initialQuestions, categories }: QuestionsViewProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenCreate = () => {
    setQuestionToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (q: Question) => {
    setQuestionToEdit(q)
    setIsModalOpen(true)
  }

  const handleSaveQuestion = async (data: QuestionFormData, questionId?: string) => {
    setMessage(null)
    let res
    if (questionId) {
      res = await updateQuestion(questionId, data)
    } else {
      res = await createQuestion(data)
    }

    if (res?.error) {
      return { error: res.error }
    }

    // Actualizar vista local
    if (questionId) {
      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? {
                ...q,
                question_text: data.question_text,
                difficulty: data.difficulty,
                question_type: data.question_type,
                category_id: data.category_id,
                category: categories.find(c => c.id === data.category_id),
                options: data.options as any,
                explanation: data.explanation,
                points: data.points,
                image_url: data.image_url || null,
              }
            : q
        )
      )
      setMessage({ type: 'success', text: 'Pregunta actualizada exitosamente.' })
    } else {
      const createdId = (res as any)?.id || Math.random().toString()
      const newQ: Question = {
        id: createdId,
        category_id: data.category_id,
        category: categories.find(c => c.id === data.category_id),
        subcategory_id: null,
        question_text: data.question_text,
        difficulty: data.difficulty,
        question_type: data.question_type,
        explanation: data.explanation,
        points: data.points,
        image_url: data.image_url || null,
        image_alt: null,
        image_caption: data.image_caption || null,
        is_active: data.is_active,
        author_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: data.options as any,
      }
      setQuestions(prev => [newQ, ...prev])
      setMessage({ type: 'success', text: 'Nueva pregunta creada en el banco con éxito.' })
    }

    return { success: true }
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta del banco?')) return

    startTransition(async () => {
      setMessage(null)
      const res = await deleteQuestion(id)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setQuestions(prev => prev.filter(q => q.id !== id))
        setMessage({ type: 'success', text: 'Pregunta eliminada del banco.' })
      }
    })
  }

  const filtered = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'ALL' || q.category_id === selectedCategory
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty
    const matchesType = selectedType === 'ALL' || q.question_type === selectedType
    return matchesSearch && matchesCat && matchesDiff && matchesType
  })

  const getQuestionTypeBadge = (type: QuestionType) => {
    switch (type) {
      case 'true_false':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
            <CheckSquare2 size={12} /> Falso / Verdadero
          </span>
        )
      case 'fill_in_the_blank':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            <Edit3 size={12} /> Completa
          </span>
        )
      case 'multiple_choice':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            <ListOrdered size={12} /> Selección Múltiple
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <FileText className="text-brand-accent" />
            Banco de Preguntas y Evaluaciones
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Crea, edita y organiza preguntas médicas por modalidad (Selección Múltiple, Falso y Verdadero, Completa).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-accent text-brand-dark font-bold px-5 py-2.5 rounded-xl hover:bg-brand-accent-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(242,196,0,0.3)] hover:scale-105"
        >
          <Plus size={18} />
          Nueva Pregunta
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-brand-error/10 border border-brand-error text-brand-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar pregunta o término..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1d21] border border-brand-border rounded-xl text-white focus:outline-none focus:border-brand-accent transition-colors text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Modalidad / Tipo de Pregunta */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#1a1d21] border border-brand-border text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-accent"
          >
            <option value="ALL">Todas las Modalidades</option>
            <option value="multiple_choice">🔘 Selección Múltiple</option>
            <option value="true_false">⚖️ Falso y Verdadero</option>
            <option value="fill_in_the_blank">✍️ Completa</option>
          </select>

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1a1d21] border border-brand-border text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-accent"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Dificultad */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#1a1d21] border border-brand-border text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-accent"
          >
            <option value="ALL">Todas las Dificultades</option>
            <option value="basic">Básico</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#14171c] border-b border-brand-border text-brand-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-1/2">Título / Enunciado de la Pregunta</th>
                <th className="px-6 py-4">Modalidad</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Dificultad</th>
                <th className="px-6 py-4 text-center">Opciones</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-brand-gray/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">
                    <p className="line-clamp-2 text-sm leading-relaxed">{q.question_text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {q.image_url && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                          Con Imagen
                        </span>
                      )}
                      <span className="text-[10px] text-brand-muted">
                        {q.points || 10} pts
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getQuestionTypeBadge(q.question_type)}
                  </td>
                  <td className="px-6 py-4 text-brand-muted text-xs whitespace-nowrap">
                    {q.category?.name ?? 'Sin Categoría'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      q.difficulty === 'basic' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      q.difficulty === 'intermediate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {q.difficulty === 'basic' ? 'Básico' : q.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-brand-muted whitespace-nowrap">
                    {q.options?.length ?? 0} opciones
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-2 text-brand-muted hover:text-brand-accent transition-colors rounded-lg hover:bg-brand-gray"
                      title="Editar pregunta"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={isPending}
                      className="p-2 text-brand-muted hover:text-brand-error transition-colors rounded-lg hover:bg-brand-gray"
                      title="Eliminar pregunta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                    <FileText size={40} className="mx-auto mb-3 opacity-30 text-brand-muted" />
                    No hay preguntas que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        categories={categories}
        questionToEdit={questionToEdit}
      />
    </div>
  )
}

