'use client'

import { useState, useTransition } from 'react'
import {
  Video, Plus, Edit3, Trash2, Eye, EyeOff, PlayCircle,
  Clock, Tag, CheckCircle2, AlertCircle, X, Save, Youtube,
  Globe, Upload, Search, Filter, BookOpen
} from 'lucide-react'
import { createLesson, updateLesson, deleteLesson, toggleLessonPublished } from '@/actions/lessons'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string
  original_url: string | null
  category: string | null
  duration_minutes: number | null
  is_published: boolean
  order_index: number
  created_at: string
  author: { full_name: string } | null
}

interface LessonsManagementProps {
  initialLessons: Lesson[]
}

const CATEGORIES = [
  'Anatomía Radiológica',
  'Rayos X Convencional',
  'Tomografía (CT/TAC)',
  'Resonancia Magnética (IRM)',
  'Ecografía / Ultrasonido',
  'Física Radiológica',
  'Protección Radiológica',
  'Patología Radiológica',
  'Intervencionismo',
  'General / Introducción',
]

const emptyForm = {
  title: '',
  description: '',
  video_url: '',
  category: 'General / Introducción',
  duration_minutes: '',
  is_published: 'false',
  order_index: '0',
}

export default function LessonsManagement({ initialLessons }: LessonsManagementProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('ALL')
  const [confirmDelete, setConfirmDelete] = useState<Lesson | null>(null)
  const [form, setForm] = useState(emptyForm)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingLesson(null)
    setShowModal(true)
  }

  const openEdit = (lesson: Lesson) => {
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.original_url || lesson.video_url,
      category: lesson.category || 'General / Introducción',
      duration_minutes: String(lesson.duration_minutes || ''),
      is_published: String(lesson.is_published),
      order_index: String(lesson.order_index),
    })
    setEditingLesson(lesson)
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    startTransition(async () => {
      let res
      if (editingLesson) {
        res = await updateLesson(editingLesson.id, fd)
      } else {
        res = await createLesson(fd)
      }

      if (res?.error) {
        showMsg('error', res.error)
      } else {
        showMsg('success', editingLesson ? '✅ Clase actualizada.' : '✅ Clase publicada exitosamente.')
        setShowModal(false)
        // Reload lessons optimistically
        window.location.reload()
      }
    })
  }

  const handleTogglePublish = (lesson: Lesson) => {
    startTransition(async () => {
      const res = await toggleLessonPublished(lesson.id, !lesson.is_published)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, is_published: !lesson.is_published } : l))
        showMsg('success', `Clase ${!lesson.is_published ? 'publicada' : 'ocultada'}.`)
      }
    })
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setConfirmDelete(null)
    startTransition(async () => {
      const res = await deleteLesson(target.id)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setLessons(prev => prev.filter(l => l.id !== target.id))
        showMsg('success', `🗑️ "${target.title}" eliminada.`)
      }
    })
  }

  const filtered = lessons.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'ALL' || l.category === catFilter
    return matchSearch && matchCat
  })

  const published = lessons.filter(l => l.is_published).length
  const draft = lessons.filter(l => !l.is_published).length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Modal de Previsualización ── */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1014] border border-brand-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <div>
                <h3 className="font-bold text-white">{previewLesson.title}</h3>
                <p className="text-xs text-brand-muted">{previewLesson.category}</p>
              </div>
              <button onClick={() => setPreviewLesson(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={previewLesson.video_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            {previewLesson.description && (
              <div className="p-4 text-sm text-brand-muted">{previewLesson.description}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Crear / Editar ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111214] border border-brand-border rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in mb-8">
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-xl">
                  <Video className="text-brand-accent" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingLesson ? 'Editar Clase' : 'Nueva Clase Pre-grabada'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white">Título de la Clase *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Anatomía del Tórax en Rayos X — Clase 1"
                  className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm placeholder:text-brand-muted"
                />
              </div>

              {/* URL del Video */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Youtube size={16} className="text-red-400" /> URL del Video *
                </label>
                <input
                  required
                  value={form.video_url}
                  onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                  className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm placeholder:text-brand-muted font-mono"
                />
                <p className="text-[11px] text-brand-muted flex items-center gap-1.5">
                  <Globe size={11} /> Soporta: YouTube, Vimeo, Google Drive, MP4 directo
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-white">Descripción / Resumen</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe los temas cubiertos en esta clase..."
                  className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm placeholder:text-brand-muted resize-none"
                />
              </div>

              {/* Categoría + Duración + Orden */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-sm font-bold text-white">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white flex items-center gap-1"><Clock size={13} /> Duración (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                    placeholder="Ej: 45"
                    className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm placeholder:text-brand-muted"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-white"># Orden</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order_index}
                    onChange={e => setForm(f => ({ ...f, order_index: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Estado de publicación */}
              <div className="flex items-center gap-4 p-4 bg-[#16191e] rounded-xl border border-brand-border">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Estado de Publicación</p>
                  <p className="text-xs text-brand-muted">Los estudiantes solo ven clases publicadas</p>
                </div>
                <div className="flex gap-2">
                  {[{ val: 'false', label: 'Borrador', color: 'bg-[#1a1d21] border-brand-border text-brand-muted' },
                    { val: 'true', label: 'Publicada', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_published: opt.val }))}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${form.is_published === opt.val ? opt.color : 'bg-[#111214] border-brand-border text-brand-muted hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted transition-colors text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,196,0,0.3)] disabled:opacity-60"
                >
                  <Save size={16} />
                  {isPending ? 'Guardando...' : (editingLesson ? 'Actualizar Clase' : 'Publicar Clase')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación de Eliminación ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111214] border border-red-500/40 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl"><Trash2 className="text-red-400" size={22} /></div>
              <div>
                <h3 className="font-bold text-white">Eliminar Clase</h3>
                <p className="text-xs text-brand-muted">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-brand-muted mb-2">¿Eliminar permanentemente:</p>
            <p className="font-bold text-white mb-6 text-base">"{confirmDelete.title}"</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-white transition-colors text-sm font-semibold">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-dark border border-brand-border p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent/20 text-brand-accent flex items-center gap-1.5">
              <Video size={12} /> Módulo de Clases
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="text-brand-accent" size={26} />
            Clases Pre-grabadas
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Sube y organiza clases en video para que los estudiantes estudien a su propio ritmo.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-3 bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,196,0,0.3)] shrink-0"
        >
          <Plus size={18} /> Nueva Clase
        </button>
      </div>

      {/* ── Alerta ── */}
      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border animate-fade-in ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-300' : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clases', value: lessons.length, color: 'text-white', bg: 'bg-brand-accent/10 text-brand-accent' },
          { label: 'Publicadas', value: published, color: 'text-emerald-400', bg: 'bg-emerald-500/10 text-emerald-400' },
          { label: 'Borradores', value: draft, color: 'text-orange-400', bg: 'bg-orange-500/10 text-orange-400' },
        ].map(k => (
          <div key={k.label} className="bg-brand-dark border border-brand-border rounded-2xl p-5 flex items-center gap-3">
            <div className={`p-3 rounded-xl ${k.bg}`}><BookOpen size={20} /></div>
            <div>
              <p className="text-xs text-brand-muted">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clase..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1d21] border border-brand-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full">
          <span className="text-xs text-brand-muted shrink-0 flex items-center gap-1"><Filter size={13} /> Cat:</span>
          <button onClick={() => setCatFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${catFilter === 'ALL' ? 'bg-brand-accent text-brand-dark' : 'bg-[#1a1d21] border border-brand-border text-brand-muted hover:text-white'}`}>Todas</button>
          {CATEGORIES.slice(0, 5).map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${catFilter === c ? 'bg-brand-accent text-brand-dark' : 'bg-[#1a1d21] border border-brand-border text-brand-muted hover:text-white'}`}>{c.split(' ')[0]}</button>
          ))}
        </div>
      </div>

      {/* ── Lista de Clases ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(lesson => (
          <div
            key={lesson.id}
            className={`bg-brand-dark border rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(242,196,0,0.08)] ${lesson.is_published ? 'border-brand-border' : 'border-dashed border-brand-border/50'}`}
          >
            {/* Thumbnail / Embed Preview area */}
            <div className="relative bg-[#0a0c10] aspect-video flex items-center justify-center group cursor-pointer" onClick={() => setPreviewLesson(lesson)}>
              {lesson.video_url.includes('youtube.com/embed') ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <PlayCircle size={18} />
                    </div>
                    <span className="text-xs font-bold">YouTube</span>
                  </div>
                </div>
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="px-4 py-2 bg-brand-accent rounded-xl text-brand-dark font-bold text-sm flex items-center gap-2">
                  <Eye size={14} /> Vista Previa
                </div>
              </div>
              <PlayCircle size={52} className="text-brand-accent opacity-30 group-hover:opacity-0 transition-opacity" />
              {!lesson.is_published && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-bold rounded-lg">BORRADOR</span>
              )}
              {lesson.is_published && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-lg">PUBLICADA</span>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{lesson.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {lesson.category && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Tag size={9} /> {lesson.category}
                      </span>
                    )}
                    {lesson.duration_minutes && (
                      <span className="text-[10px] text-brand-muted flex items-center gap-1">
                        <Clock size={10} /> {lesson.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {lesson.description && (
                <p className="text-xs text-brand-muted line-clamp-2 mb-3">{lesson.description}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPreviewLesson(lesson)}
                  className="px-3 py-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <PlayCircle size={12} /> Ver
                </button>
                <button
                  onClick={() => openEdit(lesson)}
                  className="px-3 py-1.5 bg-[#1a1d21] hover:bg-[#22252b] text-brand-muted hover:text-white border border-brand-border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit3 size={12} /> Editar
                </button>
                <button
                  onClick={() => handleTogglePublish(lesson)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    lesson.is_published
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {lesson.is_published ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Publicar</>}
                </button>
                <button
                  onClick={() => setConfirmDelete(lesson)}
                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all ml-auto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-brand-dark border border-dashed border-brand-border rounded-2xl">
          <Video size={48} className="mx-auto text-brand-muted opacity-20 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No hay clases todavía</h3>
          <p className="text-brand-muted text-sm mb-6">Sube tu primera clase pre-grabada haciendo clic en "Nueva Clase"</p>
          <button onClick={openCreate} className="px-6 py-3 bg-brand-accent text-brand-dark font-bold rounded-xl flex items-center gap-2 mx-auto hover:bg-brand-accent-light transition-all">
            <Plus size={18} /> Subir Primera Clase
          </button>
        </div>
      )}
    </div>
  )
}
