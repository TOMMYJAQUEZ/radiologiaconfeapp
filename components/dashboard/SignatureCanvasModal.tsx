'use client'

import { useRef, useState, useEffect } from 'react'
import { PenTool, RotateCcw, Check, X } from 'lucide-react'

interface SignatureCanvasModalProps {
  isOpen: boolean
  title: string
  subtitle?: string
  onSave: (dataUrl: string) => void
  onClose: () => void
}

export default function SignatureCanvasModal({
  isOpen,
  title,
  subtitle = 'Firma dentro del recuadro usando tu mouse, lápiz o dedo.',
  onSave,
  onClose,
}: SignatureCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasContent, setHasContent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // Set actual resolution
        canvas.width = canvas.offsetWidth * 2
        canvas.height = canvas.offsetHeight * 2
        ctx.scale(2, 2)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2.5
        setHasContent(false)
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasContent(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault()
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasContent) return
    // Export high-res PNG
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-400/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <PenTool size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{title}</h3>
              <p className="text-white/40 text-xs">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-5 space-y-4">
          <div className="relative rounded-xl border-2 border-dashed border-amber-400/40 bg-white overflow-hidden shadow-inner cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 block touch-none"
            />
            {/* Guide line */}
            <div className="absolute bottom-10 left-8 right-8 border-b border-dashed border-slate-300 pointer-events-none flex justify-between text-[10px] text-slate-400 px-1">
              <span>Línea de firma</span>
              <span>✦</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Trazo fluido con suavizado automático</span>
            <button
              onClick={handleClear}
              type="button"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <RotateCcw size={13} /> Limpiar lienzo
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10 bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasContent}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-400/20"
          >
            <Check size={16} /> Aplicar Firma
          </button>
        </div>
      </div>
    </div>
  )
}
