'use client'

import { useState, useTransition } from 'react'
import { BookOpen, Send, Award, CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react'
import { submitAssignment } from '@/actions/assignments'
import { requestCertificate } from '@/actions/certificates'
import { useRouter } from 'next/navigation'

interface GradeInfo {
  score?: number
  participation_score?: number
  feedback?: string
  is_published?: boolean
}

interface Submission {
  id: string
  content?: string
  submitted_at: string
  grade?: GradeInfo[] | null
}

interface Assignment {
  id: string
  title: string
  description: string
  instructions?: string
  due_date?: string
  max_score: number
  teacher?: { full_name: string }
  mySubmission?: Submission | null
}

interface GradeSummary {
  gradeExams: number
  gradeLab: number
  gradeAssignments: number
  gradeParticipation: number
  gradeTotal: number
  passingGrade: number
  canRequestCertificate: boolean
  weights: { exams: number; lab: number; assignments: number; participation: number }
}

interface Props {
  assignments: Assignment[]
  gradeSummary: GradeSummary | null
  hasCertificate: boolean
  hasPendingRequest: boolean
}

export default function StudentAssignmentsClient({ assignments, gradeSummary, hasCertificate, hasPendingRequest }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [fileMap, setFileMap] = useState<Record<string, File | null>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 5000)
  }

  const handleSubmit = (assignmentId: string) => {
    const content = contentMap[assignmentId]?.trim()
    const file = fileMap[assignmentId]
    
    if (!content && !file) { 
      showMsg('error', 'Escribe tu respuesta o sube un archivo antes de enviar.')
      return 
    }
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('assignmentId', assignmentId)
      if (content) formData.append('content', content)
      if (file) formData.append('file', file)

      const res = await submitAssignment(formData)
      if (res && 'error' in res && res.error) showMsg('error', res.error)
      else { 
        showMsg('success', '¡Tarea entregada exitosamente!')
        setFileMap(p => ({ ...p, [assignmentId]: null }))
        setContentMap(p => ({ ...p, [assignmentId]: '' }))
        router.refresh() 
      }
    })
  }

  const handleRequestCertificate = () => {
    startTransition(async () => {
      const res = await requestCertificate()
      if ('error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', '¡Solicitud de certificado enviada! El maestro y director la revisarán.'); router.refresh() }
    })
  }

  const completionPct = gradeSummary?.gradeTotal ?? 0
  const isEligible = gradeSummary?.canRequestCertificate ?? false

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-amber-400" size={32} /> Mis Tareas
        </h1>
        <p className="text-white/50 mt-1 text-sm">Entrega tus trabajos y consulta tus calificaciones.</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Resumen de notas y estado del certificado */}
      {gradeSummary && (
        <div className={`rounded-2xl border p-5 ${isEligible ? 'bg-gradient-to-br from-amber-400/10 to-emerald-500/10 border-amber-400/30' : 'bg-slate-800/60 border-white/10'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Award className={isEligible ? 'text-amber-400' : 'text-white/30'} size={20} />
              Resumen de Calificaciones
            </h2>
            <div className="text-right">
              <div className={`text-3xl font-bold ${isEligible ? 'text-amber-400' : 'text-white'}`}>{completionPct}%</div>
              <div className="text-white/40 text-xs">Nota Total · Mín: {gradeSummary.passingGrade}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: `Exámenes (${gradeSummary.weights.exams}%)`, value: gradeSummary.gradeExams },
              { label: `Laboratorio (${gradeSummary.weights.lab}%)`, value: gradeSummary.gradeLab },
              { label: `Trabajos (${gradeSummary.weights.assignments}%)`, value: gradeSummary.gradeAssignments },
              { label: `Participación (${gradeSummary.weights.participation}%)`, value: gradeSummary.gradeParticipation },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/8">
                <div className="text-white font-bold text-2xl">{item.value}%</div>
                <div className="text-white/40 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Barra de progreso */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Progreso hacia el certificado</span>
              <span>{completionPct}% / {gradeSummary.passingGrade}% mínimo</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isEligible ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(completionPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Botón solicitar certificado */}
          {hasCertificate ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle size={18} /> Certificado expedido — disponible en tu perfil
            </div>
          ) : hasPendingRequest ? (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Clock size={16} /> Solicitud en proceso de revisión por el maestro y director...
            </div>
          ) : isEligible ? (
            <button
              onClick={handleRequestCertificate}
              disabled={isPending}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Award size={18} /> Solicitar mi Certificado
            </button>
          ) : (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Lock size={14} /> Debes alcanzar {gradeSummary.passingGrade}% para solicitar el certificado.
            </div>
          )}
        </div>
      )}

      {/* Lista de tareas */}
      {assignments.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tu maestro aún no ha publicado tareas.</p>
        </div>
      )}

      <div className="space-y-4">
        {assignments.map(assignment => {
          const submission = assignment.mySubmission
          const grade = submission ? (Array.isArray(submission.grade) ? submission.grade[0] : null) : null
          const isExpanded = expandedId === assignment.id
          const isPastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false

          return (
            <div key={assignment.id} className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-semibold">{assignment.title}</h3>
                    {submission ? (
                      grade?.is_published ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 flex items-center gap-1">
                          <CheckCircle size={10} /> Calificado: {grade.score}%
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20">
                          Entregado
                        </span>
                      )
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isPastDue ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
                        {isPastDue ? 'Vencida' : 'Pendiente'}
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-1 truncate">{assignment.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-white/30">
                    <span>Maestro: {assignment.teacher?.full_name ?? '—'}</span>
                    {assignment.due_date && (
                      <span className={`flex items-center gap-1 ${isPastDue && !submission ? 'text-red-400/70' : ''}`}>
                        <Clock size={10} /> Vence: {new Date(assignment.due_date).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                {grade?.is_published && (
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="text-amber-400 font-bold text-2xl">{grade.score}%</div>
                    <div className="text-white/30 text-xs">Nota</div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 p-5 space-y-4">
                  {assignment.instructions && (
                    <div className="bg-[#1a1d24] border border-amber-400/20 rounded-xl p-5 shadow-inner">
                      <h4 className="text-amber-400/90 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen size={16} /> Instrucciones del Maestro
                      </h4>
                      <div className="text-white/80 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                        {assignment.instructions}
                      </div>
                    </div>
                  )}

                  {/* Calificación publicada */}
                  {grade?.is_published && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                      <h4 className="text-emerald-400 font-semibold text-sm flex items-center gap-2"><CheckCircle size={14} /> Tu Calificación</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-white font-bold text-2xl">{grade.score}%</div>
                          <div className="text-white/40 text-xs">Nota del Trabajo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-2xl">{grade.participation_score ?? 0}%</div>
                          <div className="text-white/40 text-xs">Participación</div>
                        </div>
                      </div>
                      {grade.feedback && (
                        <div className="mt-2 text-sm text-white/60 italic border-t border-emerald-500/20 pt-2">
                          &ldquo;{grade.feedback}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Entrega existente */}
                  {submission && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Tu Entrega</h4>
                      {submission.content && (
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap mb-3">{submission.content}</p>
                      )}
                      
                      {/* Mostrar archivo si hay (asumiendo que 'file_url' está disponible en los datos si lo añadimos) */}
                      {(submission as any).file_url && (
                        <div className="mb-3">
                          <a 
                            href={(submission as any).file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 underline"
                          >
                            Ver Archivo Adjunto
                          </a>
                        </div>
                      )}

                      {/* Advertencia de plagio */}
                      {(submission as any).plagiarism_report && (submission as any).plagiarism_report.has_plagiarism && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <h5 className="text-red-400 text-sm font-semibold flex items-center gap-2">
                            <AlertCircle size={14} /> Advertencia de Contenido Plagiado
                          </h5>
                          <p className="text-red-300 text-xs mt-1">
                            Se ha detectado posible plagio en tu entrega.
                          </p>
                          {((submission as any).plagiarism_report.sources || []).length > 0 && (
                            <div className="mt-2 text-xs text-white/70">
                              <strong>Fuentes detectadas:</strong>
                              <ul className="list-disc ml-4 mt-1">
                                {((submission as any).plagiarism_report.sources).map((source: any, idx: number) => (
                                  <li key={idx}>
                                    {source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{source.title || source.url}</a> : source.title}
                                    {source.credits && <span className="ml-1 opacity-70">({source.credits})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-white/30 text-xs mt-2">
                        Entregado: {new Date(submission.submitted_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )}

                  {/* Formulario entrega */}
                  {!grade?.is_published && (
                    <div className="space-y-3">
                      <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                        {submission ? 'Actualizar Entrega' : 'Entregar Tarea'}
                      </h4>
                      <textarea
                        rows={3}
                        value={contentMap[assignment.id] ?? submission?.content ?? ''}
                        onChange={e => setContentMap(p => ({ ...p, [assignment.id]: e.target.value }))}
                        placeholder="Escribe tu respuesta aquí (opcional si subes archivo)..."
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 resize-none"
                      />
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-white/60 text-xs font-semibold tracking-wider">Adjuntar Archivo (Word o PDF)</label>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={e => setFileMap(p => ({ ...p, [assignment.id]: e.target.files?.[0] || null }))}
                          className="text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-400/10 file:text-amber-400 hover:file:bg-amber-400/20"
                        />
                      </div>

                      <button
                        onClick={() => handleSubmit(assignment.id)}
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm mt-2"
                      >
                        <Send size={14} /> {submission ? 'Actualizar Entrega' : 'Enviar Tarea'}
                      </button>
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
