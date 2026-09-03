import { verifyCertificate } from '@/actions/certificates'
import { CheckCircle2, XCircle, ShieldCheck, Award, Calendar, User, FileText, Check, ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: { code: string }
}

export const metadata = {
  title: 'Validación de Certificado Oficial | Radiología con Fe',
  description: 'Comprobación de autenticidad académica y validez curricular.',
}

export default async function CertificateVerificationDetailPage({ params }: Props) {
  const { certificate } = await verifyCertificate(params.code)

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Radiología con Fe"
            width={240}
            height={80}
            className="h-14 md:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
            priority
          />
        </Link>
        <Link
          href="/verificar"
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Buscar otro certificado
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-3xl my-8 space-y-6">
        {certificate ? (
          <div className="bg-[#0b1329]/90 border border-amber-400/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8 relative overflow-hidden backdrop-blur-xl">
            {/* Top Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Check size={16} /> Certificado Oficial Auténtico
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    Registrado en el sistema de acreditación académica
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block font-semibold">Folio de Registro</span>
                <span className="font-mono text-brand-accent font-bold text-base sm:text-lg">{certificate.certificate_number}</span>
              </div>
            </div>

            {/* Main Student and Course Data */}
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs text-brand-muted uppercase tracking-widest font-semibold block">Otorgado con honor a:</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {certificate.student_name}
              </h1>
              <p className="text-amber-300 text-lg font-serif italic pt-1">
                {certificate.program_name}
              </p>
            </div>

            {/* Academic Metrics & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="space-y-1">
                <span className="text-xs text-white/40 flex items-center gap-1.5">
                  <Award size={13} className="text-brand-accent" />
                  Calificación Global Final
                </span>
                <span className="text-2xl font-bold text-brand-accent">
                  {certificate.grade_total != null ? `${Number(certificate.grade_total).toFixed(1)}%` : '100%'}
                </span>
                <span className="text-[11px] text-emerald-400/90 block">Completó exámenes, laboratorio, tareas y participación</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-white/40 flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-accent" />
                  Fecha de Emisión
                </span>
                <span className="text-base font-semibold text-white">
                  {new Date(certificate.issued_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-[11px] text-white/30 block">Validez permanente e inmutable</span>
              </div>
            </div>

            {/* Signatures & Authorities Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs text-brand-accent font-bold uppercase tracking-wider">Aval Docente Titular</div>
                <div className="text-white font-semibold text-sm">{certificate.teacher_name || 'Docente Responsable'}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Firma y aprobación académica validada
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs text-brand-accent font-bold uppercase tracking-wider">Dirección General</div>
                <div className="text-white font-semibold text-sm">{certificate.director_name}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Sello y firma institucional acreditada
                </div>
              </div>
            </div>

            {/* Verification Hash & Security Details */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block">Código Único Criptográfico</span>
                <span className="font-mono text-white/80 text-[11px] break-all">{certificate.verification_code || certificate.certificate_number}</span>
              </div>
              <div className="px-3 py-1 bg-brand-accent/15 border border-brand-accent/30 rounded-lg text-brand-accent font-bold text-xs">
                ESTADO: VIGENTE
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-10 text-center space-y-4">
            <XCircle size={50} className="text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Certificado No Encontrado</h2>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              El código proporcionado no corresponde a ningún certificado válido expedido en la plataforma.
            </p>
            <Link
              href="/verificar"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors mt-2"
            >
              Consultar otro código
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl py-6 border-t border-white/10 text-center text-xs text-white/40">
        © 2026 Radiología con Fe. Sistema de Validación y Registro Académico.
      </footer>
    </div>
  )
}
