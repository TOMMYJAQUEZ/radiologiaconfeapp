'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Search, Library, CheckCircle2, AlertCircle } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import CategoryModal from '@/components/dashboard/CategoryModal'
import type { Category } from '@/types'

interface CategoryItem extends Category {
  subcategories_count?: number
}

interface CategoriesViewProps {
  initialCategories: CategoryItem[]
}

export default function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenCreate = () => {
    setCategoryToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: CategoryItem) => {
    setCategoryToEdit(cat)
    setIsModalOpen(true)
  }

  const handleSaveCategory = async (formData: FormData, categoryId?: string) => {
    setMessage(null)
    let res
    if (categoryId) {
      res = await updateCategory(categoryId, formData)
    } else {
      res = await createCategory(formData)
    }

    if (res?.error) {
      return { error: res.error }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const isActive = formData.get('is_active') === 'true'

    if (categoryId) {
      setCategories(prev =>
        prev.map(c =>
          c.id === categoryId
            ? { ...c, name, description, is_active: isActive }
            : c
        )
      )
      setMessage({ type: 'success', text: 'Categoría médica actualizada con éxito.' })
    } else {
      const createdId = (res as any)?.id || Math.random().toString()
      const newCat: CategoryItem = {
        id: createdId,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon: null,
        color: null,
        is_active: isActive,
        order_index: categories.length + 1,
        created_at: new Date().toISOString(),
        subcategories_count: 0,
      }
      setCategories(prev => [...prev, newCat])
      setMessage({ type: 'success', text: 'Nueva categoría médica registrada.' })
    }

    return { success: true }
  }

  const handleDelete = (categoryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Si tiene preguntas asociadas no se podrá borrar.')) return

    startTransition(async () => {
      setMessage(null)
      const res = await deleteCategory(categoryId)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setCategories(prev => prev.filter(c => c.id !== categoryId))
        setMessage({ type: 'success', text: 'Categoría eliminada.' })
      }
    })
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
            <Library className="text-brand-accent" />
            Categorías y Materias Médicas
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Gestiona las materias, ramas radiológicas y áreas de estudio de la plataforma.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-accent text-brand-dark font-bold px-5 py-2.5 rounded-xl hover:bg-brand-accent-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(242,196,0,0.3)] hover:scale-105"
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-brand-error/10 border border-brand-error text-brand-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar categoría médica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1d21] border border-brand-border rounded-xl text-white focus:outline-none focus:border-brand-accent transition-colors text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#14171c] border-b border-brand-border text-brand-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Materia / Área</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-center">Subcategorías</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-brand-gray/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <Library size={16} className="text-brand-accent" />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-brand-muted text-xs max-w-xs truncate">
                    {cat.description || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-brand-muted">
                    {cat.subcategories_count ?? 0} ramas
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cat.is_active
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 text-brand-muted hover:text-brand-accent transition-colors rounded-lg hover:bg-brand-gray"
                      title="Editar categoría"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={isPending}
                      className="p-2 text-brand-muted hover:text-brand-error transition-colors rounded-lg hover:bg-brand-gray"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brand-muted">
                    No se encontraron categorías.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />
    </div>
  )
}
