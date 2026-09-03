'use client'

import { useRef } from 'react'
import { Download, Printer, QrCode, ShieldCheck, Sparkles } from 'lucide-react'

interface CertificateData {
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
  is_sample?: boolean
}

interface CertificatePreviewProps {
  data: CertificateData
  showActions?: boolean
}

export default function CertificatePreview({ data, showActions = true }: CertificatePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const verificationUrl = `https://radiologiaconfe.com/verificar/${data.verification_code || data.certificate_number}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}&color=f2e08a&bgcolor=06091a`

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=1200,height=850')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8"/>
      <title>Certificado Oficial — ${data.certificate_number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"/>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}@page{size:A4 landscape;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
    </head><body>${content.innerHTML}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  const issuedDate = new Date(data.issued_at).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const certStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1060px',
    aspectRatio: '1.414 / 1',
    background: 'linear-gradient(135deg, #050814 0%, #081229 40%, #050e20 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '44px 56px',
    color: '#fff',
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {showActions && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-5xl">
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Certificado digital oficial con código QR y validación pública</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-slate-900 font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm shadow-lg shadow-amber-400/20"
            >
              <Download size={16} />
              Descargar / Imprimir PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors text-sm"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Certificado Renderizado */}
      <div
        ref={printRef}
        style={certStyle}
        className="shadow-[0_30px_100px_rgba(0,0,0,0.85)] rounded-2xl border border-[#c9a84c]/30"
      >
        {/* Marco exterior dorado doble */}
        <div style={{ position: 'absolute', inset: '14px', border: '2px solid #c9a84c', borderRadius: '12px', pointerEvents: 'none', zIndex: 10 }} />
        <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '9px', pointerEvents: 'none', zIndex: 10 }} />

        {/* Marca de agua de radiación / cruz médica */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '260px', opacity: 0.03, pointerEvents: 'none', userSelect: 'none', color: '#c9a84c', lineHeight: 1, zIndex: 0 }}>✦</div>

        {/* Esquinas decorativas */}
        {[
          { top: '24px', left: '24px', borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', borderRadius: '4px 0 0 0' },
          { top: '24px', right: '24px', borderTop: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', borderRadius: '0 4px 0 0' },
          { bottom: '24px', left: '24px', borderBottom: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c', borderRadius: '0 0 0 4px' },
          { bottom: '24px', right: '24px', borderBottom: '2px solid #c9a84c', borderRight: '2px solid #c9a84c', borderRadius: '0 0 4px 0' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: '36px', height: '36px', zIndex: 11, ...s }} />
        ))}

        {/* Banner de muestra académica (si es demo/sample) */}
        {data.is_sample && (
          <div style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(242,196,0,0.15)', border: '1px solid rgba(242,196,0,0.4)', borderRadius: '20px', padding: '4px 14px', fontSize: '9px', color: '#f2e08a', letterSpacing: '2px', textTransform: 'uppercase', zIndex: 30, fontWeight: 700 }}>
            ✦ Modelo de Presentación Académica
          </div>
        )}

        {/* Contenido Principal */}
        <div style={{ position: 'relative', zIndex: 20, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo Oficial de Radiología con Fe */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Radiología con Fe Academy"
                style={{ 
                  height: '115px', 
                  width: 'auto', 
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 0 24px rgba(245,158,11,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))',
                  background: 'transparent',
                }}
              />
            </div>
            <div style={{ fontFamily: '"Cinzel",Georgia,serif', fontSize: '13px', letterSpacing: '4px', color: '#c9a84c', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
              {data.institution_name}
            </div>
          </div>

          {/* Línea divisoria dorada con brillo */}
          <div style={{ width: '92%', height: '1px', background: 'linear-gradient(90deg,transparent,#c9a84c 30%,#f2e08a 50%,#c9a84c 70%,transparent)', margin: '6px 0 8px' }} />

          {/* Texto 'Certifica que' */}
          <div style={{ fontFamily: '"Cinzel",Georgia,serif', fontSize: '10px', letterSpacing: '6px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Otorga el presente certificado a
          </div>

          {/* Nombre del Estudiante */}
          <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: '38px', fontWeight: 700, color: '#f2e08a', letterSpacing: '1px', lineHeight: 1.1, marginBottom: '6px', textShadow: '0 2px 20px rgba(242,224,138,0.2)' }}>
            {data.student_name}
          </div>

          {/* Texto de cumplimiento */}
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.5px', lineHeight: 1.5, marginBottom: '4px', maxWidth: '780px' }}>
            Por haber completado y aprobado con éxito todas las exigencias académicas, evaluaciones de la plataforma, prácticas del Laboratorio de Anatomía y trabajos requeridos en el programa de:
          </div>

          {/* Nombre del Programa Académico */}
          <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: '21px', fontStyle: 'italic', color: '#c9a84c', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>
            {data.program_name}
          </div>

          {/* Calificación Final */}
          {data.grade_total != null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '20px', padding: '3px 18px', marginBottom: '6px' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>Promedio Global de Acreditación</span>
              <span style={{ color: '#f2e08a', fontWeight: 700, fontSize: '16px', fontFamily: '"Playfair Display",serif' }}>{Number(data.grade_total).toFixed(1)}%</span>
            </div>
          )}

          {/* Fecha de Emisión */}
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            Expedido en Santo Domingo, República Dominicana el {issuedDate}
          </div>

          {/* Línea antes de firmas */}
          <div style={{ width: '92%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3) 20%,rgba(201,168,76,0.3) 80%,transparent)', margin: '2px 0 10px' }} />

          {/* Zona Inferior: Firma Maestro | Sello & QR | Firma Director */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '92%', gap: '20px' }}>
            {/* Firma Maestro */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {data.teacher_signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={data.teacher_signature} 
                  alt="Firma Maestro" 
                  style={{ 
                    height: '46px', 
                    maxWidth: '160px', 
                    objectFit: 'contain', 
                    filter: 'brightness(0) invert(1)', 
                    opacity: 0.95, 
                    margin: '0 auto 4px', 
                    display: 'block' 
                  }} 
                />
              ) : (
                <div style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>[Pendiente de firma del docente]</span>
                </div>
              )}
              <div style={{ width: '140px', height: '1px', background: 'rgba(201,168,76,0.6)', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '11px', color: '#f2e08a', fontWeight: 600, letterSpacing: '0.5px' }}>{data.teacher_name ?? 'Docente Titular'}</div>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Docente Responsable</div>
            </div>

            {/* Sello y Código QR Oficial */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {/* QR Code Scannable */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', padding: '3px', background: '#050814', border: '1px solid rgba(201,168,76,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR Verificación" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '6px', color: '#c9a84c', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Escanear QR</div>
              </div>

              {/* Sello Institucional con Logo Oficial */}
              <div style={{ width: '70px', height: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'transparent' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="Sello Oficial" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain', 
                    filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.85))' 
                  }} 
                />
              </div>
            </div>

            {/* Firma Director */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {data.director_signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={data.director_signature} 
                  alt="Firma Director" 
                  style={{ 
                    height: '46px', 
                    maxWidth: '160px', 
                    objectFit: 'contain', 
                    filter: 'brightness(0) invert(1)', 
                    opacity: 0.95, 
                    margin: '0 auto 4px', 
                    display: 'block' 
                  }} 
                />
              ) : (
                <div style={{ height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>[Pendiente de firma del director]</span>
                </div>
              )}
              <div style={{ width: '140px', height: '1px', background: 'rgba(201,168,76,0.6)', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '11px', color: '#f2e08a', fontWeight: 600, letterSpacing: '0.5px' }}>{data.director_name}</div>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Director General</div>
            </div>
          </div>

          {/* Footer de Verificación Institucional */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '92%', marginTop: '10px', padding: '4px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
              Folio: <strong style={{ color: '#f2e08a' }}>{data.certificate_number}</strong>
            </span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
              Validar en: <strong style={{ color: '#c9a84c' }}>radiologiaconfe.com/verificar</strong>
            </span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
              Hash: {(data.verification_code || data.certificate_number).slice(0, 10).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

