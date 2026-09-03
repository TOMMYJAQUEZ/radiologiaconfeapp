'use client'

import { useState, useTransition } from 'react'
import { Award, Search, CheckCircle2, XCircle, ShieldCheck, QrCode, ArrowRight, ExternalLink } from 'lucide-react'
import { verifyCertificate } from '@/actions/certificates'
import Link from 'next/link'
import Image from 'next/image'

export default function VerificationPortalPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    startTransition(async () => {
      setHasSearched(true)
      const res = await verifyCertificate(code)
      setResult(res.certificate)
    })
  }

  return (
    <div className="min-h-screen bg-[#070c18] text-white flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-4 border-b border-white/10">
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
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
        >
          Acceso al Campus
        </Link>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl my-12 space-y-8 animate-fade-in text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> Portal Oficial de Verificación
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Validador de Certificados Académicos
          </h1>
          <p className="text-white/60 text-sm max-w-lg mx-auto">
            Verifica la autenticidad de los certificados emitidos por <strong className="text-brand-accent">Radiología con Fe</strong> mediante el código de verificación o número de folio.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="bg-slate-900/80 border border-white/15 p-2 sm:p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10 focus-within:border-brand-accent transition-colors">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código o folio (ej: RCF-2026-0001 o DEMO)"
              className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className="px-6 py-3 bg-brand-accent hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(242,196,0,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? 'Verificando...' : <><span>Consultar</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Results Card */}
        {hasSearched && (
          <div className="animate-fade-in">
            {result ? (
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-left space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-bl-xl flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> CERTIFICADO AUTÉNTICO Y VÁLIDO
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-brand-accent font-bold">{result.certificate_number}</span>
                  <h2 className="text-2xl font-bold text-white">{result.student_name}</h2>
                  <p className="text-white/60 text-sm">{result.program_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/10 text-sm">
                  <div>
                    <span className="text-xs text-white/40 block">Institución Emisora</span>
                    <span className="font-semibold text-white">{result.institution_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-white/40 block">Director General</span>
                    <span className="font-semibold text-white">{result.director_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-white/40 block">Docente Titular</span>
                    <span className="font-semibold text-white">{result.teacher_name || 'Docente Responsable'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-white/40 block">Calificación Obtenida</span>
                    <span className="font-bold text-brand-accent text-lg">
                      {result.grade_total != null ? `${Number(result.grade_total).toFixed(1)}%` : 'Aprobado'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
                  <span>Expedido: {new Date(result.issued_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <Link
                    href={`/verificar/${result.verification_code || result.certificate_number}`}
                    className="text-brand-accent hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Ver dictamen completo y QR</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-8 text-center space-y-3">
                <XCircle size={40} className="text-red-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Certificado No Encontrado</h3>
                <p className="text-white/50 text-sm max-w-md mx-auto">
                  No existe ningún certificado registrado con el código ingresado. Verifica que el folio o código sea el correcto.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <QrCode size={20} className="text-brand-accent" />
            <h4 className="text-xs font-bold text-white">Validación QR Instantánea</h4>
            <p className="text-[11px] text-white/40">Escaneable desde cualquier smartphone con cámara.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <ShieldCheck size={20} className="text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Doble Aval Oficial</h4>
            <p className="text-[11px] text-white/40">Firmado por el Docente Titular y la Dirección General.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <Award size={20} className="text-purple-400" />
            <h4 className="text-xs font-bold text-white">Registro Inmutable</h4>
            <p className="text-[11px] text-white/40">Folio único e infalsificable en la plataforma.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-white/10 text-center text-xs text-white/40">
        © 2026 Radiología con Fe. Sistema de Acreditación y Validación Académica.
      </footer>
    </div>
  )
}
