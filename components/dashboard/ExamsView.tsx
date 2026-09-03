'use client'

import { useState, useTransition } from 'react'
import { Plus, Play, Edit2, Trash2, BookOpen, Clock, Users, Award, Eye, EyeOff, CheckCircle2, AlertCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { createExam, updateExam, toggleExamPublished, deleteExam } from '@/actions/teacher'
import ExamModal from '@/components/dashboard/ExamModal'
import type { Category } from '@/types'

interface ExamItem {
  id: string
  title: string
  description: string | null
  category_id: string
  categoryName: string
  question_count: number
  time_limit_minutes: number | null
  passing_score: number
  difficulty: string | null
  is_published: boolean
  attemptsCount: number
}

interface CategoryWithCount extends Category {
  questions_count?: number
}

interface ExamsViewProps {
  initialExams: ExamItem[]
  categories: CategoryWithCount[]
}

export default function ExamsView({ initialExams, categories }: ExamsViewProps) {
  const [exams, setExams] = useState<ExamItem[]>(initialExams)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [examToEdit, setExamToEdit] = useState<ExamItem | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenCreate = () => {
    setExamToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (exam: ExamItem) => {
    setExamToEdit(exam)
    setIsModalOpen(true)
  }

  const handleSaveExam = async (formData: FormData, examId?: string) => {
    setMessage(null)
    let res
    if (examId) {
      res = await updateExam(examId, formData)
    } else {
      res = await createExam(formData)
    }

    if (res?.error) {
      return { error: res.error }
    }

    const catId = formData.get('category_id') as string
    const categoryName = categories.find(c => c.id === catId)?.name || 'General'
    const isPub = formData.get('is_published') === 'true'

    if (examId) {
      setExams(prev =>
        prev.map(e =>
          e.id === examId
            ? {
                ...e,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category_id: catId,
                categoryName,
                question_count: Number(formData.get('question_count')),
                time_limit_minutes: Number(formData.get('time_limit_minutes')),
                passing_score: Number(formData.get('passing_score')),
                difficulty: formData.get('difficulty') as string,
                is_published: isPub,
              }
            : e
        )
      )
      setMessage({ type: 'success', text: 'Examen actualizado con éxito.' })
    } else {
      const createdId = (res as any)?.id || Math.random().toString()
      const newExam: ExamItem = {
        id: createdId,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category_id: catId,
        categoryName,
        question_count: Number(formData.get('question_count')),
        time_limit_minutes: Number(formData.get('time_limit_minutes')),
        passing_score: Number(formData.get('passing_score')),
        difficulty: formData.get('difficulty') as string,
        is_published: isPub,
        attemptsCount: 0,
      }
      setExams(prev => [newExam, ...prev])
      setMessage({
        type: 'success',
        text: isPub
          ? '¡Nuevo examen creado y publicado! Se ha notificado a todos los estudiantes.'
          : 'Nuevo examen creado en estado Borrador.',
      })
    }

    return { success: true }
  }

  const handleTogglePublish = (examId: string, currentStatus: boolean) => {
    startTransition(async () => {
      setMessage(null)
      const res = await toggleExamPublished(examId, !currentStatus)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setExams(prev =>
          prev.map(e => (e.id === examId ? { ...e, is_published: !currentStatus } : e))
        )
        setMessage({
          type: 'success',
          text: !currentStatus
            ? '✅ ¡Examen publicado con éxito! Se ha notificado a todos los estudiantes registrados.'
            : '⏸️ Examen despublicado (ha vuelto a estado Borrador).',
        })
      }
    })
  }

  const handleDelete = (examId: string) => {
    if (!confirm('¿Estás seguro de eliminar este examen? Esta acción no se puede deshacer.')) return

    startTransition(async () => {
      setMessage(null)
      const res = await deleteExam(examId)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setExams(prev => prev.filter(e => e.id !== examId))
        setMessage({ type: 'success', text: '🗑️ Examen eliminado correctamente.' })
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <BookOpen className="text-brand-accent" />
            Gestión y Publicación de Exámenes
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Configura, publica y administra las evaluaciones médicas que reciben los estudiantes.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-accent text-brand-dark font-bold px-5 py-2.5 rounded-xl hover:bg-brand-accent-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(242,196,0,0.3)] hover:scale-105"
        >
          <Plus size={18} />
          Nuevo Examen
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 animate-fade-in ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-brand-error/10 border border-brand-error text-brand-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Grid de Exámenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className={`bg-[#16191e] border rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-xl group ${
              exam.is_published ? 'border-brand-border hover:border-brand-accent/60' : 'border-dashed border-brand-border/80 opacity-90'
            }`}
          >
            <div className="p-6">
              {/* Header Card con Estado */}
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    exam.is_published
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                      : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${exam.is_published ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                  {exam.is_published ? 'Publicado' : 'Borrador'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1.5 text-brand-muted hover:text-white hover:bg-[#202429] rounded-lg transition-colors"
                    title="Editar examen"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    disabled={isPending}
                    className="p-1.5 text-brand-muted hover:text-brand-error hover:bg-brand-error/10 rounded-lg transition-colors"
                    title="Eliminar examen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-accent transition-colors leading-snug">
                {exam.title}
              </h3>
              <p className="text-xs text-brand-muted font-medium mb-3">{exam.categoryName}</p>

              {exam.description && (
                <p className="text-xs text-brand-muted line-clamp-2 mb-4 leading-relaxed">
                  {exam.description}
                </p>
              )}

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-brand-border/60 text-xs text-brand-muted">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-brand-accent" />
                  <span>{exam.question_count} Preguntas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-blue-400" />
                  <span>{exam.time_limit_minutes ? `${exam.time_limit_minutes} mins` : 'Sin límite'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-green-400" />
                  <span>Mínimo {exam.passing_score}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-purple-400" />
                  <span>{exam.attemptsCount} Intentos</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar: Publicar / Despublicar y Preview */}
            <div className="bg-[#121417] px-5 py-3.5 border-t border-brand-border flex items-center justify-between gap-2">
              {exam.is_published ? (
                <button
                  onClick={() => handleTogglePublish(exam.id, true)}
                  disabled={isPending}
                  className="text-xs font-bold text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  title="Despublicar examen"
                >
                  <EyeOff size={14} /> Despublicar
                </button>
              ) : (
                <button
                  onClick={() => handleTogglePublish(exam.id, false)}
                  disabled={isPending}
                  className="text-xs font-bold text-white bg-green-600 hover:bg-green-500 border border-green-500 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] hover:scale-105"
                  title="Publicar examen y notificar a los estudiantes"
                >
                  <Send size={14} /> Publicar Examen
                </button>
              )}

              <Link
                href={`/exam/${exam.id}`}
                className="text-xs font-bold text-brand-accent hover:text-brand-accent-light transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30"
              >
                <Play size={14} /> Probar
              </Link>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full text-center py-16 bg-[#16191e] border border-brand-border rounded-2xl">
            <BookOpen size={48} className="mx-auto text-brand-muted mb-3 opacity-30" />
            <p className="text-white font-bold">No hay exámenes creados todavía</p>
            <p className="text-brand-muted text-sm mt-1">
              Haz clic en &quot;Nuevo Examen&quot; para configurar tu primera evaluación médica y publicarla para tus alumnos.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExam}
        categories={categories}
        examToEdit={examToEdit}
      />
    </div>
  )
}

