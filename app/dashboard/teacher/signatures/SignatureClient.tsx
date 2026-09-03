'use client'

import { useState, useTransition } from 'react'
import { PenLine, Upload, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { saveSignature, deleteSignature } from '@/actions/signatures'
import { useRouter } from 'next/navigation'

interface Props {
  currentSignature?: string | null
  updatedAt?: string | null
}

export default function SignatureClient({ currentSignature, updatedAt }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(currentSignature ?? null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!preview) { showMsg('error', 'Selecciona una imagen de firma primero.'); return }
    startTransition(async () => {
      const res = await saveSignature(preview)
      if ('error' in res && res.error) showMsg('error', res.error)
      else { showMsg('success', 'Firma guardada correctamente. Aparecerá en los certificados.'); router.refresh() }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteSignature()
      if ('error' in res && res.error) showMsg('error', res.error)
      else { setPreview(null); showMsg('success', 'Firma eliminada.'); router.refresh() }
    })
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <PenLine className="text-amber-400" size={32} />
          Mi Firma Digital
        </h1>
        <p className="text-white/50 mt-1 text-sm">
          Tu firma aparecerá en los certificados de tus estudiantes cuando sean expedidos.
        </p>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 text-blue-300 text-sm">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Instrucciones para la firma</p>
          <ul className="space-y-1 text-blue-300/80 text-xs list-disc list-inside">
            <li>Firma en papel blanco con tinta negra o azul</li>
            <li>Toma una foto o escanea en buena calidad</li>
            <li>Guarda como PNG o JPG (fondo blanco recomendado)</li>
            <li>La firma se mostrará con nitidez en el certificado institucional</li>
          </ul>
        </div>
      </div>

      {/* Estado actual */}
      {currentSignature && updatedAt && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400" />
            <div>
              <div className="text-emerald-400 font-semibold text-sm">Firma registrada</div>
              <div className="text-emerald-400/60 text-xs">Actualizada: {new Date(updatedAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Zona de subida */}
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold">
          {currentSignature ? 'Actualizar Firma' : 'Subir Firma'}
        </h3>

        <label className="flex flex-col items-center justify-center gap-3 p-8 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-xl cursor-pointer transition-all group">
          <Upload size={32} className="text-white/30 group-hover:text-amber-400 transition-colors" />
          <div className="text-center">
            <div className="text-white/60 font-medium text-sm group-hover:text-white transition-colors">
              Haz clic para seleccionar una imagen
            </div>
            <div className="text-white/30 text-xs mt-1">PNG, JPG — fondo blanco recomendado</div>
          </div>
          <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleUpload} className="hidden" />
        </label>

        {/* Vista previa */}
        {preview && (
          <div className="space-y-3">
            <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider">Vista Previa</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <div className="text-white/30 text-xs mb-2 text-center">Original (fondo blanco)</div>
                <div className="bg-white rounded-xl p-4 flex items-center justify-center min-h-[100px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Firma original" className="max-h-20 max-w-full object-contain" />
                </div>
              </div>
              {/* En certificado */}
              <div>
                <div className="text-white/30 text-xs mb-2 text-center">En el certificado (fondo oscuro)</div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Firma en certificado" className="max-h-20 max-w-full object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending || !preview}
            className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {isPending ? 'Guardando...' : <><CheckCircle size={16} /> Guardar Firma</>}
          </button>
          {currentSignature && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-5 py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
