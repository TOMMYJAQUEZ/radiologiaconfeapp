'use client'

import { useState, useTransition } from 'react'
import { BookOpen, Plus, Eye, Check, Send, AlertCircle, CheckCircle, Users, Clock, Download, List, ListOrdered, FileText, Trash2, Edit2 } from 'lucide-react'
import { createAssignment, updateAssignment, deleteAssignment, toggleAssignmentPublish, getAssignmentSubmissions, gradeSubmission, publishGrade } from '@/actions/assignments'
import { useRouter } from 'next/navigation'

interface Assignment {
  id: string
  title: string
  description: string
  instructions?: string
  due_date?: string
  max_score: number
  is_published: boolean
  created_at: string
  teacher?: { full_name: string }
  category?: { name: string } | null
}

interface Props {
  assignments: Assignment[]
  userRole: string
}

export default function AssignmentsDashboardClient({ assignments: initialAssignments, userRole }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, unknown[]>>({})
  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: string; participation: string; feedback: string }>>({})
  const [form, setForm] = useState({ id: '', title: '', description: '', instructions: '', due_date: '', max_score: '100' })

  void userRole

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleCreateOrUpdate = () => {
    if (!form.title.trim() || !form.description.trim()) { showMsg('error', 'Título y descripción son requeridos.'); return }
    startTransition(async () => {
      let res;
      if (form.id) {
        res = await updateAssignment(form.id, {
          title: form.title, description: form.description,
          instructions: form.instructions || undefined,
          due_date: form.due_date || undefined,
          max_score: Number(form.max_score),
        })
      } else {
        res = await createAssignment({
          title: form.title, description: form.description,
          instructions: form.instructions || undefined,
          due_date: form.due_date || undefined,
          max_score: Number(form.max_score),
        })
      }
      if (res && 'error' in res && res.error) showMsg('error', res.error)
      else { 
        showMsg('success', form.id ? 'Tarea actualizada.' : 'Tarea creada. Publícala cuando esté lista.'); 
        setShowCreate(false); 
        setForm({ id: '', title: '', description: '', instructions: '', due_date: '', max_score: '100' }); 
        router.refresh() 
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea? Esto eliminará también todas las entregas.')) return;
    startTransition(async () => {
      const res = await deleteAssignment(id)
      if (res && 'error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', 'Tarea eliminada.'); router.refresh() }
    })
  }

  const handleTogglePublish = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleAssignmentPublish(id, !current)
      if ('error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', !current ? 'Tarea publicada.' : 'Tarea despublicada.'); router.refresh() }
    })
  }

  const handleViewSubmissions = (assignmentId: string) => {
    if (viewingId === assignmentId) { setViewingId(null); return }
    setViewingId(assignmentId)
    startTransition(async () => {
      const res = await getAssignmentSubmissions(assignmentId)
      setSubmissions(prev => ({ ...prev, [assignmentId]: res.submissions as unknown[] }))
    })
  }

  const handleGrade = (submissionId: string, currentViewingId: string | null) => {
    const g = gradeInputs[submissionId]
    if (!g?.score) { showMsg('error', 'Ingresa una calificación.'); return }
    startTransition(async () => {
      const res = await gradeSubmission({
        submissionId,
        score: Number(g.score),
        participationScore: Number(g.participation || 0),
        feedback: g.feedback,
      })
      if ('error' in res && res.error) showMsg('error', res.error)
      else {
        showMsg('success', 'Calificación guardada.')
        if (currentViewingId) {
          const r = await getAssignmentSubmissions(currentViewingId)
          setSubmissions(prev => ({ ...prev, [currentViewingId]: r.submissions as unknown[] }))
        }
      }
    })
  }

  const handlePublishGrade = (submissionId: string, currentViewingId: string | null) => {
    startTransition(async () => {
      const res = await publishGrade(submissionId)
      if ('error' in res && res.error) showMsg('error', res.error)
      else {
        showMsg('success', 'Nota publicada al estudiante.')
        if (currentViewingId) {
          const r = await getAssignmentSubmissions(currentViewingId)
          setSubmissions(prev => ({ ...prev, [currentViewingId]: r.submissions as unknown[] }))
        }
      }
    })
  }

  const handleInsertText = (prefix: string) => {
    setForm(p => ({
      ...p,
      instructions: p.instructions + (p.instructions.endsWith('\n') || p.instructions === '' ? '' : '\n') + prefix
    }))
  }

  const handleTemplate = () => {
    setForm(p => ({
      ...p,
      instructions: `Responde el siguiente cuestionario:\n\n1. \n2. \n3. \n\n*Nota: Sube tu documento o responde aquí mismo.*`
    }))
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-amber-400" size={32} /> Gestión de Tareas
          </h1>
          <p className="text-white/50 mt-1 text-sm">Crea, califica y publica trabajos para tus estudiantes.</p>
        </div>
        <button
          onClick={() => {
            setForm({ id: '', title: '', description: '', instructions: '', due_date: '', max_score: '100' })
            setShowCreate(v => !v)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}

      {showCreate && (
        <div className="bg-slate-800/80 border border-amber-400/20 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-lg">{form.id ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Título *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50" placeholder="Ej: Identificación de estructuras en RX Tórax" />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Nota Máxima</label>
              <input type="number" value={form.max_score} onChange={e => setForm(p => ({ ...p, max_score: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50" />
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">Descripción *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 resize-none" placeholder="Descripción breve visible al estudiante..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-white/60 text-xs">Instrucciones detalladas (Cuestionario)</label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleInsertText('• ')} className="p-1 text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-colors" title="Lista con viñetas">
                  <List size={14} />
                </button>
                <button type="button" onClick={() => handleInsertText('1. ')} className="p-1 text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-colors" title="Lista numerada">
                  <ListOrdered size={14} />
                </button>
                <button type="button" onClick={handleTemplate} className="p-1 text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-colors flex items-center gap-1 text-[10px]" title="Plantilla de Cuestionario">
                  <FileText size={14} /> Plantilla
                </button>
              </div>
            </div>
            <textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} rows={6} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400/50 resize-y" placeholder="Instrucciones paso a paso o preguntas del cuestionario..." />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">Fecha límite</label>
            <input type="datetime-local" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateOrUpdate} disabled={isPending} className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm disabled:opacity-50">
              {isPending ? 'Guardando...' : form.id ? 'Actualizar Tarea' : 'Crear Tarea (borrador)'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {initialAssignments.length === 0 && !showCreate && (
        <div className="text-center py-16 text-white/40">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aún no has creado tareas. ¡Comienza creando la primera!</p>
        </div>
      )}

      <div className="space-y-4">
        {initialAssignments.map(assignment => {
          const isViewing = viewingId === assignment.id
          const subs = (submissions[assignment.id] ?? []) as Array<{
            id: string
            content?: string
            file_url?: string
            plagiarism_report?: { has_plagiarism: boolean; score: number; sources: any[] }
            submitted_at: string
            student?: { full_name: string; student_id?: string }
            grade?: Array<{ score?: number; participation_score?: number; feedback?: string; is_published?: boolean }> | null
          }>

          return (
            <div key={assignment.id} className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-semibold truncate">{assignment.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${assignment.is_published ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-white/40 bg-white/5 border-white/10'}`}>
                      {assignment.is_published ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-1 truncate">{assignment.description}</p>
                  {assignment.due_date && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400/70 mt-1">
                      <Clock size={10} /> Vence: {new Date(assignment.due_date).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setForm({
                        id: assignment.id,
                        title: assignment.title,
                        description: assignment.description,
                        instructions: assignment.instructions || '',
                        due_date: assignment.due_date ? assignment.due_date.slice(0, 16) : '',
                        max_score: assignment.max_score.toString()
                      })
                      setShowCreate(true)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                    title="Editar Tarea"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    disabled={isPending}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar Tarea"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => handleViewSubmissions(assignment.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs transition-colors ml-2"
                  >
                    <Users size={12} /> Entregas
                  </button>
                  <button
                    onClick={() => handleTogglePublish(assignment.id, assignment.is_published)}
                    disabled={isPending}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${assignment.is_published ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-amber-400 hover:bg-amber-300 text-slate-900'}`}
                  >
                    {assignment.is_published ? 'Despublicar' : 'Publicar'}
                  </button>
                </div>
              </div>

              {isViewing && (
                <div className="border-t border-white/10 p-5">
                  <h4 className="text-white/70 text-sm font-semibold mb-4 flex items-center gap-2">
                    <Eye size={14} /> Entregas de Estudiantes ({subs.length})
                  </h4>
                  {subs.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-6">Ningún estudiante ha entregado aún.</p>
                  ) : (
                    <div className="space-y-4">
                      {subs.map(sub => {
                        const grade = Array.isArray(sub.grade) ? sub.grade[0] : null
                        const gi = gradeInputs[sub.id] ?? { score: grade?.score?.toString() ?? '', participation: grade?.participation_score?.toString() ?? '', feedback: grade?.feedback ?? '' }
                        return (
                          <div key={sub.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-white font-medium text-sm">{sub.student?.full_name ?? 'Estudiante'}</div>
                                <div className="text-white/30 text-xs">Entregado: {new Date(sub.submitted_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}</div>
                              </div>
                              {grade?.is_published ? (
                                <span className="text-emerald-400 text-xs flex items-center gap-1"><Check size={12} /> Nota Publicada: {grade.score}%</span>
                              ) : grade?.score ? (
                                <span className="text-blue-400 text-xs">Calificado (sin publicar): {grade.score}%</span>
                              ) : null}
                            </div>
                            {sub.content && (
                              <div className="bg-white/5 rounded-lg p-3 text-white/70 text-xs leading-relaxed max-h-32 overflow-auto">{sub.content}</div>
                            )}

                            {sub.file_url && (
                              <div className="flex items-center gap-2 mt-2">
                                <a 
                                  href={sub.file_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  download
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <Download size={14} /> Descargar Archivo para Corregir
                                </a>
                              </div>
                            )}

                            {sub.plagiarism_report?.has_plagiarism && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <h5 className="text-red-400 text-xs font-semibold flex items-center gap-1">
                                  <AlertCircle size={12} /> Posible Plagio Detectado ({sub.plagiarism_report.score}%)
                                </h5>
                                {sub.plagiarism_report.sources?.length > 0 && (
                                  <ul className="list-disc ml-4 mt-1 text-white/60 text-[11px]">
                                    {sub.plagiarism_report.sources.map((src, idx) => (
                                      <li key={idx}>
                                        {src.url ? <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{src.title || src.url}</a> : src.title}
                                        {src.credits && <span className="ml-1 opacity-70">({src.credits})</span>}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-white/40 text-xs mb-1">Nota (0-100)</label>
                                <input type="number" min="0" max="100" value={gi.score}
                                  onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...gi, score: e.target.value } }))}
                                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/50" />
                              </div>
                              <div>
                                <label className="block text-white/40 text-xs mb-1">Participación (0-100)</label>
                                <input type="number" min="0" max="100" value={gi.participation}
                                  onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...gi, participation: e.target.value } }))}
                                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/50" />
                              </div>
                              <div>
                                <label className="block text-white/40 text-xs mb-1">Comentario</label>
                                <input value={gi.feedback}
                                  onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...gi, feedback: e.target.value } }))}
                                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/50" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleGrade(sub.id, viewingId)} disabled={isPending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold disabled:opacity-50">
                                <Check size={12} /> Guardar Nota
                              </button>
                              {grade?.score && !grade.is_published && (
                                <button onClick={() => handlePublishGrade(sub.id, viewingId)} disabled={isPending}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold disabled:opacity-50">
                                  <Send size={12} /> Publicar Nota
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
