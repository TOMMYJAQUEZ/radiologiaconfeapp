'use client'

import { useState, useTransition } from 'react'
import { Award, CheckCircle, XCircle, Clock, Settings, Eye, ChevronDown, ChevronUp, AlertCircle, Check, X, FileText, ExternalLink, QrCode, ShieldCheck, PenTool, Upload, Trash2, RefreshCw, Sparkles, Save } from 'lucide-react'
import { teacherReviewCertificate, directorReviewCertificate, saveDirectorConfig } from '@/actions/certificates'
import { saveSignature } from '@/actions/signatures'
import CertificatePreview from '@/components/dashboard/CertificatePreview'
import SignatureCanvasModal from '@/components/dashboard/SignatureCanvasModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type RequestStatus = 'pending' | 'teacher_approved' | 'teacher_rejected' | 'director_approved' | 'director_rejected' | 'issued'

interface CertRequest {
  id: string
  student_id: string
  grade_exams?: number
  grade_lab?: number
  grade_assignments?: number
  grade_participation?: number
  grade_total?: number
  status: RequestStatus
  teacher_note?: string
  director_note?: string
  created_at: string
  student?: { id: string; full_name: string; email: string; student_id?: string }
  teacher?: { id: string; full_name: string } | null
}

interface Certificate {
  id: string
  certificate_number: string
  student_name: string
  program_name: string
  institution_name: string
  teacher_name?: string | null
  director_name: string
  grade_total?: number | null
  teacher_signature?: string | null
  director_signature?: string | null
  verification_code: string
  issued_at: string
}

interface DirectorConfig {
  institution_name: string
  program_name: string
  director_name: string
  director_title: string
  passing_grade: number
  weight_exams: number
  weight_lab: number
  weight_assignments: number
  weight_participation: number
  certificate_footer?: string
  director_signature_b64?: string
}

interface Props {
  requests: CertRequest[]
  certificates: Certificate[]
  config: DirectorConfig | null
  userRole: string
  userName: string
}

const STATUS_LABELS: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <Clock size={12} /> },
  teacher_approved: { label: 'Aprobado por Maestro', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <Check size={12} /> },
  teacher_rejected: { label: 'Rechazado por Maestro', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <X size={12} /> },
  director_approved: { label: 'Aprobado por Director', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <Check size={12} /> },
  director_rejected: { label: 'Rechazado por Director', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <X size={12} /> },
  issued: { label: 'Expedido', color: 'text-amber-300 bg-amber-300/10 border-amber-300/20', icon: <Award size={12} /> },
}

// Firmas de muestra predefinidas en SVG estilizado
const SAMPLE_TEACHER_SIG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100' width='300' height='100'><path d='M 30 70 Q 60 15, 90 60 T 140 45 Q 170 10, 190 70 T 240 35 Q 260 70, 280 30' fill='none' stroke='%23ffffff' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/><path d='M 45 85 Q 140 75, 265 80' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round'/></svg>"
const SAMPLE_DIRECTOR_SIG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100' width='300' height='100'><path d='M 25 45 Q 65 85, 95 20 T 150 75 Q 185 25, 215 65 T 275 30' fill='none' stroke='%23ffffff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/><path d='M 45 25 L 95 85 M 205 35 L 255 85' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/><path d='M 20 92 Q 140 70, 280 88' fill='none' stroke='%23ffffff' stroke-width='3' stroke-linecap='round'/></svg>"

export default function CertificatesDashboardClient({ requests, certificates, config, userRole, userName }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'requests' | 'issued' | 'modelo' | 'settings'>('requests')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Canvas modal state
  const [canvasModal, setCanvasModal] = useState<{ isOpen: boolean; target: 'teacher' | 'director' }>({
    isOpen: false,
    target: 'director',
  })

  // Test certificate live state
  const [testForm, setTestForm] = useState({
    student_name: 'Lic. María Elena Santos',
    program_name: config?.program_name || 'Técnico Superior en Radiología e Imágenes Diagnósticas',
    institution_name: config?.institution_name || 'Radiología con Fe Academy',
    teacher_name: 'Lic. Carlos Mendoza, RT',
    director_name: config?.director_name || 'Lic. Francisco Jáquez',
    grade_total: 96.5,
    certificate_number: 'RCF-2026-DEMO-001',
    verification_code: 'RCF-DEMO-SAMPLE-2026-VERIFIED',
    teacher_signature: null as string | null,
    director_signature: config?.director_signature_b64 ?? null as string | null,
  })

  // Config state
  const [cfgForm, setCfgForm] = useState<DirectorConfig>(config ?? {
    institution_name: 'Radiología con Fe Academy', program_name: 'Técnico en Radiología e Imágenes Diagnósticas', director_name: 'Francisco Jáquez',
    director_title: 'Director General', passing_grade: 70, weight_exams: 35, weight_lab: 25,
    weight_assignments: 25, weight_participation: 15,
  })
  const [sigPreview, setSigPreview] = useState<string | null>(config?.director_signature_b64 ?? null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleTeacherAction = (requestId: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await teacherReviewCertificate(requestId, action, noteMap[requestId])
      if ('error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', action === 'approve' ? 'Solicitud aprobada.' : 'Solicitud rechazada.'); router.refresh() }
    })
  }

  const handleDirectorAction = (requestId: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await directorReviewCertificate(requestId, action, noteMap[requestId])
      if ('error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', action === 'approve' ? '¡Certificado expedido exitosamente!' : 'Solicitud rechazada.'); router.refresh() }
    })
  }

  const handleSaveConfig = () => {
    startTransition(async () => {
      const res = await saveDirectorConfig({ ...cfgForm, director_signature_b64: sigPreview ?? undefined })
      if ('error' in res && res.error) showMsg('error', res.error)
      else showMsg('success', 'Configuración guardada correctamente.')
    })
  }

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSigPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Simulator Signature Handlers
  const handleTestUpload = (target: 'teacher' | 'director', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result as string
      if (target === 'teacher') {
        setTestForm(prev => ({ ...prev, teacher_signature: b64 }))
      } else {
        setTestForm(prev => ({ ...prev, director_signature: b64 }))
      }
      showMsg('success', `Firma del ${target === 'teacher' ? 'Docente' : 'Director'} adjuntada al certificado de prueba.`)
    }
    reader.readAsDataURL(file)
  }

  const handleCanvasSave = (dataUrl: string) => {
    if (canvasModal.target === 'teacher') {
      setTestForm(prev => ({ ...prev, teacher_signature: dataUrl }))
      showMsg('success', 'Firma del Docente dibujada y adjuntada.')
    } else {
      setTestForm(prev => ({ ...prev, director_signature: dataUrl }))
      showMsg('success', 'Firma del Director dibujada y adjuntada.')
    }
  }

  const handleSaveDirectorSigPermanently = () => {
    if (!testForm.director_signature) {
      showMsg('error', 'Primero adjunta o dibuja una firma para el Director.')
      return
    }
    startTransition(async () => {
      const res = await saveSignature(testForm.director_signature!)
      if ('error' in res && res.error) {
        showMsg('error', res.error)
      } else {
        showMsg('success', '✅ Firma guardada oficialmente en el sistema como firma del Director.')
        router.refresh()
      }
    })
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const teacherApproved = requests.filter(r => r.status === 'teacher_approved')
  const rejectedOrIssued = requests.filter(r => ['teacher_rejected', 'director_rejected', 'issued'].includes(r.status))

  const tabs = [
    { id: 'requests' as const, label: 'Solicitudes', count: requests.filter(r => !['issued','director_rejected'].includes(r.status)).length },
    { id: 'issued' as const, label: 'Certificados Expedidos', count: certificates.length },
    { id: 'modelo' as const, label: '🧪 Simulador & Test de Firmas', count: 0 },
    ...(userRole === 'ADMIN' ? [{ id: 'settings' as const, label: 'Configuración', count: 0 }] : []),
  ]

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Award className="text-amber-400" size={32} />
            Gestión de Certificados
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            {userRole === 'ADMIN' ? 'Panel del Director — aprobación y expedición' : 'Panel del Maestro — revisión y aprobación'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-white font-semibold text-sm">{userName}</div>
            <div className="text-white/40 text-xs">{userRole === 'ADMIN' ? 'Director' : 'Maestro'}</div>
          </div>
        </div>
      </div>

      {/* Alerta global */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pendientes', value: pendingRequests.length, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
          { label: 'Aprobados por Maestro', value: teacherApproved.length, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Expedidos', value: certificates.length, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { label: 'Total Solicitudes', value: requests.length, color: 'text-white', bg: 'bg-white/5 border-white/10' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.bg}`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-white/50 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-400 text-slate-900' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-slate-900/20 text-slate-900' : 'bg-amber-400/20 text-amber-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB: SOLICITUDES ═══ */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <Award size={48} className="mx-auto mb-3 opacity-30" />
              <p>No hay solicitudes de certificado.</p>
            </div>
          )}

          {requests.map(req => {
            const statusInfo = STATUS_LABELS[req.status]
            const isExpanded = expandedId === req.id
            const canTeacherAct = userRole === 'TEACHER' && req.status === 'pending'
            const canDirectorAct = userRole === 'ADMIN' && req.status === 'teacher_approved'

            return (
              <div key={req.id} className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {req.student?.full_name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{req.student?.full_name ?? 'Estudiante'}</div>
                      <div className="text-white/40 text-xs">{req.student?.email} · {new Date(req.created_at).toLocaleDateString('es-DO')}</div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {req.grade_total != null && (
                      <div className="text-right">
                        <div className="text-amber-400 font-bold text-lg">{Number(req.grade_total).toFixed(1)}%</div>
                        <div className="text-white/30 text-xs">Nota Total</div>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 p-5 space-y-5">
                    {/* Desglose de notas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Exámenes', value: req.grade_exams },
                        { label: 'Laboratorio', value: req.grade_lab },
                        { label: 'Trabajos', value: req.grade_assignments },
                        { label: 'Participación', value: req.grade_participation },
                      ].map(g => (
                        <div key={g.label} className="bg-white/5 rounded-lg p-3 text-center border border-white/8">
                          <div className="text-white font-bold text-xl">{g.value != null ? `${Number(g.value).toFixed(0)}%` : '—'}</div>
                          <div className="text-white/40 text-xs mt-1">{g.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Notas de revisión anteriores */}
                    {req.teacher_note && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-300">
                        <span className="font-semibold">Nota del Maestro:</span> {req.teacher_note}
                      </div>
                    )}
                    {req.director_note && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300">
                        <span className="font-semibold">Nota del Director:</span> {req.director_note}
                      </div>
                    )}

                    {/* Acciones */}
                    {(canTeacherAct || canDirectorAct) && (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Nota opcional (comentario de revisión)..."
                          value={noteMap[req.id] ?? ''}
                          onChange={e => setNoteMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                          rows={2}
                          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 resize-none"
                        />
                        <div className="flex gap-3">
                          <button
                            disabled={isPending}
                            onClick={() => canTeacherAct ? handleTeacherAction(req.id, 'approve') : handleDirectorAction(req.id, 'approve')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
                          >
                            <CheckCircle size={16} /> Aprobar
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => canTeacherAct ? handleTeacherAction(req.id, 'reject') : handleDirectorAction(req.id, 'reject')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
                          >
                            <XCircle size={16} /> Rechazar
                          </button>
                        </div>
                        {canDirectorAct && (
                          <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 text-amber-300 text-xs flex items-start gap-2">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            Al aprobar, se genera y expide el certificado definitivo con tu firma y la del maestro.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ TAB: CERTIFICADOS EXPEDIDOS ═══ */}
      {activeTab === 'issued' && (
        <div className="space-y-4">
          {certificates.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <Award size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aún no se han expedido certificados.</p>
            </div>
          )}

          {previewCert && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 overflow-auto">
              <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-bold text-xl">Vista Previa del Certificado</h2>
                  <button onClick={() => setPreviewCert(null)} className="text-white/50 hover:text-white transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
                <CertificatePreview data={previewCert} showActions={true} />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-slate-800/60 border border-amber-400/20 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-amber-300 font-mono text-xs font-bold">{cert.certificate_number}</div>
                    <div className="text-white font-bold text-lg mt-1">{cert.student_name}</div>
                    <div className="text-white/40 text-xs">{cert.program_name}</div>
                  </div>
                  {cert.grade_total != null && (
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-2xl">{Number(cert.grade_total).toFixed(1)}%</div>
                      <div className="text-white/30 text-xs">Nota Final</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Expedido: {new Date(cert.issued_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="font-mono text-amber-400/70">Código: {cert.verification_code.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Eye size={14} /> Ver / Imprimir
                  </button>
                  <Link
                    href={`/verificar/${cert.verification_code || cert.certificate_number}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <ShieldCheck size={14} /> Validar QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB: SIMULADOR Y TEST DE FIRMAS (DIRECTOR & DOCENTE) ═══ */}
      {activeTab === 'modelo' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#081229] border border-amber-400/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} className="text-amber-400" /> Simulador de Certificación Oficial
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  Estudio de Prueba y Validación de Firmas
                </h2>
                <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
                  Genera certificados de prueba en tiempo real, prueba el nuevo <strong className="text-amber-300">Logo Institucional de la Academia</strong>, y valida cómo se estampan y visualizan las firmas digitales del <strong className="text-white">Docente</strong> y del <strong className="text-white">Director</strong> tanto en pantalla como al imprimir/descargar en PDF.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/verificar/demo"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10"
                >
                  <ShieldCheck size={16} /> Portal de Verificación
                </Link>
                <Link
                  href="/verificar"
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold rounded-xl text-sm transition-all"
                >
                  <ExternalLink size={16} /> Verificador Público
                </Link>
              </div>
            </div>
          </div>

          {/* Panel de Controles Interactivos (2 Columnas: Datos + Firmas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Datos del Certificado de Prueba (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <FileText size={18} className="text-amber-400" /> Datos del Estudiante y Curso
                </h3>
                <button
                  type="button"
                  onClick={() => setTestForm({
                    student_name: 'Lic. María Elena Santos',
                    program_name: config?.program_name || 'Técnico Superior en Radiología e Imágenes Diagnósticas',
                    institution_name: config?.institution_name || 'Radiología con Fe Academy',
                    teacher_name: 'Lic. Carlos Mendoza, RT',
                    director_name: config?.director_name || 'Lic. Francisco Jáquez',
                    grade_total: 96.5,
                    certificate_number: 'RCF-2026-DEMO-001',
                    verification_code: 'RCF-DEMO-SAMPLE-2026-VERIFIED',
                    teacher_signature: null,
                    director_signature: config?.director_signature_b64 ?? null,
                  })}
                  className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw size={12} /> Restablecer
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-white/60 text-xs mb-1 font-medium">Nombre Completo del Estudiante</label>
                  <input
                    type="text"
                    value={testForm.student_name}
                    onChange={e => setTestForm(prev => ({ ...prev, student_name: e.target.value }))}
                    placeholder="Ej: Lic. María Elena Santos"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-1 font-medium">Nombre del Programa Académico</label>
                  <input
                    type="text"
                    value={testForm.program_name}
                    onChange={e => setTestForm(prev => ({ ...prev, program_name: e.target.value }))}
                    placeholder="Ej: Diplomado en Tomografía Computarizada"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-xs mb-1 font-medium">Docente Titular</label>
                    <input
                      type="text"
                      value={testForm.teacher_name}
                      onChange={e => setTestForm(prev => ({ ...prev, teacher_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1 font-medium">Director General</label>
                    <input
                      type="text"
                      value={testForm.director_name}
                      onChange={e => setTestForm(prev => ({ ...prev, director_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-white/60 text-xs font-medium">Promedio Global</label>
                      <span className="text-amber-400 font-bold text-xs">{testForm.grade_total}%</span>
                    </div>
                    <input
                      type="number"
                      min="60"
                      max="100"
                      step="0.5"
                      value={testForm.grade_total}
                      onChange={e => setTestForm(prev => ({ ...prev, grade_total: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1 font-medium">Folio de Registro</label>
                    <input
                      type="text"
                      value={testForm.certificate_number}
                      onChange={e => setTestForm(prev => ({ ...prev, certificate_number: e.target.value }))}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/60 font-mono text-amber-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Gestor y Test de Firmas en Vivo (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <PenTool size={18} className="text-amber-400" /> Gestor de Firmas Digitales (Test en Vivo)
                </h3>
                <span className="text-[11px] text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  Transparencia y Alto Contraste
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Tarjeta Firma Docente */}
                <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      👨‍🏫 Firma Docente
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${testForm.teacher_signature ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                      {testForm.teacher_signature ? '✓ Adjuntada' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Previsualización del recuadro de firma */}
                  <div className="h-16 bg-[#050814] rounded-lg border border-white/10 flex items-center justify-center p-2 relative overflow-hidden group">
                    {testForm.teacher_signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testForm.teacher_signature}
                        alt="Firma Docente"
                        className="max-h-12 max-w-full object-contain filter invert brightness-100"
                      />
                    ) : (
                      <span className="text-white/20 text-xs italic">Sin firma adjuntada</span>
                    )}
                  </div>

                  {/* Botones de acción Docente */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCanvasModal({ isOpen: true, target: 'teacher' })}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
                    >
                      <PenTool size={13} /> Dibujar
                    </button>
                    <label className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer">
                      <Upload size={13} /> Subir PNG
                      <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={e => handleTestUpload('teacher', e)} className="hidden" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTestForm(prev => ({ ...prev, teacher_signature: SAMPLE_TEACHER_SIG }))
                        showMsg('success', 'Firma de muestra del docente aplicada.')
                      }}
                      className="text-amber-400/80 hover:text-amber-300 text-[11px] font-medium"
                    >
                      ⭐ Usar muestra
                    </button>
                    {testForm.teacher_signature && (
                      <button
                        type="button"
                        onClick={() => setTestForm(prev => ({ ...prev, teacher_signature: null }))}
                        className="text-red-400/80 hover:text-red-300 text-[11px] flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Tarjeta Firma Director */}
                <div className="bg-slate-800/60 border border-amber-400/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      🏛️ Firma Director
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${testForm.director_signature ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                      {testForm.director_signature ? '✓ Adjuntada' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Previsualización del recuadro de firma */}
                  <div className="h-16 bg-[#050814] rounded-lg border border-amber-400/30 flex items-center justify-center p-2 relative overflow-hidden group">
                    {testForm.director_signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testForm.director_signature}
                        alt="Firma Director"
                        className="max-h-12 max-w-full object-contain filter invert brightness-100"
                      />
                    ) : (
                      <span className="text-white/20 text-xs italic">Sin firma adjuntada</span>
                    )}
                  </div>

                  {/* Botones de acción Director */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCanvasModal({ isOpen: true, target: 'director' })}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
                    >
                      <PenTool size={13} /> Dibujar
                    </button>
                    <label className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer">
                      <Upload size={13} /> Subir PNG
                      <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={e => handleTestUpload('director', e)} className="hidden" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTestForm(prev => ({ ...prev, director_signature: SAMPLE_DIRECTOR_SIG }))
                        showMsg('success', 'Firma de muestra del director aplicada.')
                      }}
                      className="text-amber-400/80 hover:text-amber-300 text-[11px] font-medium"
                    >
                      ⭐ Usar muestra
                    </button>
                    {testForm.director_signature && (
                      <button
                        type="button"
                        onClick={() => setTestForm(prev => ({ ...prev, director_signature: null }))}
                        className="text-red-400/80 hover:text-red-300 text-[11px] flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Quitar
                      </button>
                    )}
                  </div>

                  {/* Botón para guardar permanentemente como firma del Director */}
                  {userRole === 'ADMIN' && testForm.director_signature && (
                    <button
                      type="button"
                      onClick={handleSaveDirectorSigPermanently}
                      disabled={isPending}
                      className="w-full mt-2 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold rounded-lg text-[11px] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Save size={13} /> Guardar esta como mi Firma Oficial
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Muestra y Renderizado en Vivo del Certificado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Award size={22} className="text-amber-400" /> Vista Previa Oficial en Tiempo Real
              </h3>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Actualizado automáticamente
              </div>
            </div>

            <CertificatePreview
              data={{
                certificate_number: testForm.certificate_number,
                student_name: testForm.student_name,
                program_name: testForm.program_name,
                institution_name: testForm.institution_name,
                teacher_name: testForm.teacher_name,
                director_name: testForm.director_name,
                grade_total: testForm.grade_total,
                teacher_signature: testForm.teacher_signature,
                director_signature: testForm.director_signature,
                verification_code: testForm.verification_code,
                issued_at: new Date().toISOString(),
                is_sample: true,
              }}
              showActions={true}
            />
          </div>
        </div>
      )}

      {/* Modal interactivo de dibujo de firmas en Canvas */}
      <SignatureCanvasModal
        isOpen={canvasModal.isOpen}
        title={canvasModal.target === 'teacher' ? 'Dibujar Firma del Docente Titular' : 'Dibujar Firma de la Dirección General'}
        subtitle="Usa el mouse, stylus o pantalla táctil para firmar con trazo suave y natural."
        onSave={handleCanvasSave}
        onClose={() => setCanvasModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* ═══ TAB: CONFIGURACIÓN (solo Director) ═══ */}
      {activeTab === 'settings' && userRole === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Datos de la institución */}
            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Settings size={18} className="text-amber-400" /> Datos del Certificado
              </h3>

              {[
                { label: 'Nombre de la Institución', key: 'institution_name' },
                { label: 'Nombre del Programa', key: 'program_name' },
                { label: 'Nombre del Director', key: 'director_name' },
                { label: 'Título del Director', key: 'director_title' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-white/60 text-xs mb-1.5 font-medium">{label}</label>
                  <input
                    type="text"
                    value={cfgForm[key as keyof DirectorConfig] as string}
                    onChange={e => setCfgForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              ))}

              <div>
                <label className="block text-white/60 text-xs mb-1.5 font-medium">Nota Mínima para Certificado (%)</label>
                <input
                  type="number" min="0" max="100"
                  value={cfgForm.passing_grade}
                  onChange={e => setCfgForm(prev => ({ ...prev, passing_grade: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            {/* Pesos de evaluación */}
            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-bold text-lg">⚖️ Pesos de Evaluación</h3>
              <p className="text-white/40 text-xs">La suma de los 4 pesos debe ser 100%.</p>

              {[
                { label: 'Exámenes', key: 'weight_exams' },
                { label: 'Laboratorio', key: 'weight_lab' },
                { label: 'Trabajos / Tareas', key: 'weight_assignments' },
                { label: 'Participación', key: 'weight_participation' },
              ].map(({ label, key }) => {
                const val = cfgForm[key as keyof DirectorConfig] as number
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-white/60 text-xs font-medium">{label}</label>
                      <span className="text-amber-400 font-bold text-xs">{val}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={val}
                      onChange={e => setCfgForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                )
              })}

              <div className={`flex justify-between text-sm font-bold p-3 rounded-lg border ${(cfgForm.weight_exams + cfgForm.weight_lab + cfgForm.weight_assignments + cfgForm.weight_participation) === 100 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <span>Total:</span>
                <span>{cfgForm.weight_exams + cfgForm.weight_lab + cfgForm.weight_assignments + cfgForm.weight_participation}%</span>
              </div>
            </div>
          </div>

          {/* Firma del Director */}
          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">✍️ Firma del Director</h3>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="text-white/40 text-sm mb-3">Sube una imagen PNG o JPG de tu firma manuscrita. Aparecerá en todos los certificados expedidos.</p>
                <label className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl cursor-pointer transition-colors text-white/60 text-sm">
                  Seleccionar imagen de firma...
                  <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleSigUpload} className="hidden" />
                </label>
              </div>
              {sigPreview && (
                <div className="bg-white rounded-xl p-4 min-w-[180px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sigPreview} alt="Vista previa firma" className="max-h-20 max-w-[180px] object-contain" />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isPending}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {isPending ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      )}
    </div>
  )
}
