'use client'

import { useState } from 'react'
import {
  PlayCircle, Clock, Tag, Search, Filter, ChevronRight,
  BookOpen, Video, X, Eye
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string
  category: string | null
  duration_minutes: number | null
  order_index: number
  created_at: string
  author: { full_name: string } | null
}

interface StudentLessonsProps {
  lessons: Lesson[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Anatomía Radiológica': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Rayos X Convencional': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Tomografía (CT/TAC)': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Resonancia Magnética (IRM)': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Ecografía / Ultrasonido': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Física Radiológica': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Protección Radiológica': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Patología Radiológica': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Intervencionismo': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'General / Introducción': 'bg-brand-accent/20 text-brand-accent border-brand-accent/30',
}

export default function StudentLessons({ lessons }: StudentLessonsProps) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('ALL')
  const [watchingLesson, setWatchingLesson] = useState<Lesson | null>(null)

  const categories = Array.from(new Set(lessons.map(l => l.category).filter(Boolean))) as string[]

  const filtered = lessons.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'ALL' || l.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Modal Reproductor ── */}
      {watchingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0a0c10] border border-brand-border rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">{watchingLesson.title}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  {watchingLesson.category && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[watchingLesson.category] || 'bg-brand-accent/20 text-brand-accent border-brand-accent/30'}`}>
                      {watchingLesson.category}
                    </span>
                  )}
                  {watchingLesson.duration_minutes && (
                    <span className="text-xs text-brand-muted flex items-center gap-1">
                      <Clock size={11} /> {watchingLesson.duration_minutes} min
                    </span>
                  )}
                  {watchingLesson.author?.full_name && (
                    <span className="text-xs text-brand-muted">Por: {watchingLesson.author.full_name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setWatchingLesson(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-muted hover:text-white ml-4 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Player */}
            <div className="aspect-video w-full bg-black">
              <iframe
                src={watchingLesson.video_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </div>

            {/* Description */}
            {watchingLesson.description && (
              <div className="p-5 border-t border-brand-border">
                <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-2">Descripción de la Clase</h4>
                <p className="text-sm text-brand-muted leading-relaxed">{watchingLesson.description}</p>
              </div>
            )}

            {/* Navigation: Next Lesson */}
            {(() => {
              const idx = filtered.findIndex(l => l.id === watchingLesson.id)
              const next = filtered[idx + 1]
              return next ? (
                <div
                  className="mx-4 mb-4 p-4 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-accent transition-colors group"
                  onClick={() => setWatchingLesson(next)}
                >
                  <div>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Siguiente Clase</p>
                    <p className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">{next.title}</p>
                  </div>
                  <ChevronRight className="text-brand-accent" size={22} />
                </div>
              ) : null
            })()}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-brand-dark to-[#0f1318] border border-brand-border rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent/20 text-brand-accent inline-flex items-center gap-1.5 mb-2">
            <Video size={12} /> Clases Pre-grabadas
          </span>
          <h1 className="text-2xl font-bold text-white mb-1">Biblioteca de Clases</h1>
          <p className="text-brand-muted text-sm">
            Aprende a tu propio ritmo. Estudia las clases cuando quieras y cuantas veces necesites.
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-brand-muted"><strong className="text-white">{lessons.length}</strong> clases disponibles</span>
            <span className="text-brand-muted"><strong className="text-white">{categories.length}</strong> categorías</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />
      </div>

      {/* ── Búsqueda + Filtros ── */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clase por nombre o tema..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1d21] border border-brand-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
          <span className="text-xs text-brand-muted shrink-0 flex items-center gap-1"><Filter size={12} /></span>
          <button
            onClick={() => setCatFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${catFilter === 'ALL' ? 'bg-brand-accent text-brand-dark shadow-[0_0_12px_rgba(242,196,0,0.3)]' : 'bg-[#1a1d21] border border-brand-border text-brand-muted hover:text-white'}`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all whitespace-nowrap ${catFilter === cat ? 'bg-brand-accent text-brand-dark shadow-[0_0_12px_rgba(242,196,0,0.3)]' : 'bg-[#1a1d21] border border-brand-border text-brand-muted hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de Clases ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((lesson, idx) => (
            <div
              key={lesson.id}
              onClick={() => setWatchingLesson(lesson)}
              className="bg-brand-dark border border-brand-border rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-brand-accent hover:shadow-[0_0_25px_rgba(242,196,0,0.1)] group"
            >
              {/* Thumbnail Area */}
              <div className="relative bg-[#080a0d] aspect-video flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                {/* Number badge */}
                <span className="absolute top-3 left-3 z-20 w-7 h-7 bg-brand-accent/90 text-brand-dark font-black text-xs rounded-lg flex items-center justify-center">
                  {idx + 1}
                </span>

                {/* Play button center */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-brand-accent/20 border-2 border-brand-accent/50 flex items-center justify-center group-hover:bg-brand-accent group-hover:border-brand-accent transition-all group-hover:scale-110 duration-200">
                  <PlayCircle size={32} className="text-brand-accent group-hover:text-brand-dark transition-colors" />
                </div>

                {/* Play overlay text */}
                <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 bg-brand-accent rounded-lg text-brand-dark text-xs font-bold flex items-center gap-1.5">
                    <Eye size={12} /> Reproducir
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-accent transition-colors flex-1">
                    {lesson.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {lesson.category && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[lesson.category] || 'bg-brand-accent/20 text-brand-accent border-brand-accent/30'}`}>
                      <Tag size={9} className="inline mr-1" />{lesson.category}
                    </span>
                  )}
                  {lesson.duration_minutes && (
                    <span className="text-[10px] text-brand-muted flex items-center gap-1">
                      <Clock size={10} /> {lesson.duration_minutes} min
                    </span>
                  )}
                </div>

                {lesson.description && (
                  <p className="text-xs text-brand-muted line-clamp-2 mb-3">{lesson.description}</p>
                )}

                <div className="flex items-center justify-between">
                  {lesson.author?.full_name && (
                    <span className="text-[10px] text-brand-muted">Por {lesson.author.full_name}</span>
                  )}
                  <ChevronRight size={16} className="text-brand-muted group-hover:text-brand-accent transition-colors ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-dark border border-dashed border-brand-border rounded-2xl">
          <Video size={48} className="mx-auto text-brand-muted opacity-20 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No hay clases disponibles</h3>
          <p className="text-brand-muted text-sm">Próximamente se agregarán clases para tu estudio.</p>
        </div>
      )}
    </div>
  )
}
