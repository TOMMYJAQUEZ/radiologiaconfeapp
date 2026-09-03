'use client'

import { useState, useEffect } from 'react'
import { X, Library, AlertCircle } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FormData, categoryId?: string) => Promise<{ success?: boolean; error?: string }>
  categoryToEdit?: any | null
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
}: CategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '')
      setDescription(categoryToEdit.description || '')
      setIsActive(categoryToEdit.is_active ?? true)
    } else {
      setName('')
      setDescription('')
      setIsActive(true)
    }
    setError(null)
  }, [categoryToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la categoría o materia.')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('description', description.trim())
      fd.append('is_active', String(isActive))

      const res = await onSave(fd, categoryToEdit?.id)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando la categoría.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111214] border border-brand-border rounded-2xl w-full max-w-lg my-8 overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-brand-border flex justify-between items-center bg-[#16191e]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Library className="text-brand-accent" size={20} />
              {categoryToEdit ? 'Editar Categoría / Materia' : 'Nueva Categoría Médica'}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Organiza las áreas de estudio de la plataforma
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-white p-2 rounded-lg hover:bg-brand-gray transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-brand-error/10 border border-brand-error text-brand-error rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Nombre de la Categoría *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Protección Radiológica, Rayos X, Tomografía Axial"
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Descripción / Temario</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de los contenidos y alcances de esta materia médica..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl p-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent border-brand-border bg-[#1a1d21]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none">
              Categoría Activa (Visible para exámenes y laboratorio)
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-white transition-colors text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-accent text-brand-dark hover:bg-brand-accent-light transition-all text-sm font-bold shadow-[0_0_15px_rgba(242,196,0,0.3)] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : categoryToEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
