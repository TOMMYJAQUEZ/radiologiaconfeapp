'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Search, Sparkles, Video, BookOpen, ScrollText, Layers, ExternalLink, X, Loader2, Command } from 'lucide-react'
import { globalSearch, type SearchResultItem } from '@/actions/search'
import { useRouter } from 'next/navigation'

export default function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Atajo de teclado: Ctrl+K o Cmd+K para abrir buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus en el input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(query)
        setResults(res.results || [])
        setSelectedIndex(0)
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Navegación con teclado dentro de la lista
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % (results.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false)
    router.push(item.url)
  }

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'anatomy':
        return <Sparkles size={16} className="text-amber-400" />
      case 'lesson':
        return <Video size={16} className="text-blue-400" />
      case 'exam':
        return <BookOpen size={16} className="text-emerald-400" />
      case 'assignment':
        return <ScrollText size={16} className="text-purple-400" />
      default:
        return <Layers size={16} className="text-white/60" />
    }
  }

  return (
    <>
      {/* Search trigger bar in header */}
      <div
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2.5 bg-[#0f172a] hover:bg-[#131d35] px-4 py-2 rounded-full w-80 lg:w-96 border border-[#334155] hover:border-brand-accent/50 cursor-pointer transition-all group"
      >
        <Search size={16} className="text-brand-muted group-hover:text-brand-accent transition-colors" />
        <span className="text-xs text-brand-muted group-hover:text-white/80 transition-colors flex-1">
          Buscar anatomía, clases, exámenes...
        </span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-muted bg-white/5 border border-white/10 rounded">
          <Command size={10} /> K
        </kbd>
      </div>

      {/* Botón trigger móvil */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-full hover:bg-white/5 text-brand-muted hover:text-white transition-colors"
        aria-label="Abrir buscador"
      >
        <Search size={20} />
      </button>

      {/* Modal / Spotlight Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-[#0a1122] border border-[#1e293b] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search size={20} className="text-brand-accent flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe para buscar lecciones, tomografías, rayos X, tareas..."
                className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-white/30"
              />
              {isPending && <Loader2 size={18} className="text-brand-accent animate-spin flex-shrink-0" />}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-white/40 hover:text-white p-1 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
              {query.trim().length >= 2 && results.length === 0 && !isPending && (
                <div className="text-center py-12 text-white/40">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-white/30 mt-1">Prueba buscando por estructura anatómica, modalidad o tema.</p>
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="p-4 space-y-3">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Sugerencias Rápidas
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'RX Tórax PA', sub: 'Laboratorio de Anatomía', url: '/dashboard/anatomy-lab?study=rx-torax-pa' },
                      { label: 'TAC Cerebral Axial', sub: 'Ventrículos y Ganglios', url: '/dashboard/anatomy-lab?study=tac-cerebral-axial' },
                      { label: 'IRM Columna Lumbar', sub: 'Corte Sagital T2', url: '/dashboard/anatomy-lab?study=irm-columna-lumbar' },
                      { label: 'Mis Tareas & Certificados', sub: 'Calificaciones y entregas', url: '/dashboard/student/assignments' },
                    ].map(sug => (
                      <div
                        key={sug.label}
                        onClick={() => {
                          setIsOpen(false)
                          router.push(sug.url)
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors border border-white/5"
                      >
                        <div className="text-white font-medium text-xs">{sug.label}</div>
                        <div className="text-white/40 text-[10px] mt-0.5">{sug.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-accent text-slate-900 shadow-md'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900/20' : 'bg-white/5'}`}>
                        {getItemIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-sm truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-white'}`}>
                          {item.title}
                        </div>
                        <div className={`text-xs truncate ${isSelected ? 'text-slate-800' : 'text-white/40'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-slate-900 text-brand-accent'
                            : 'bg-white/10 text-white/60 border border-white/10'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ExternalLink size={14} className={isSelected ? 'text-slate-900' : 'text-white/30'} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-t border-white/10 text-[11px] text-white/40">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd> Navegar</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd> Seleccionar</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> Cerrar</span>
              </div>
              <span className="text-brand-accent font-semibold">Radiología con Fe</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
