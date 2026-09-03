'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Eye, ShieldCheck, GraduationCap, Users, ChevronDown, Check, Sparkles } from 'lucide-react'
import { switchRole } from '@/actions/auth'

interface RoleSwitcherProps {
  actualRole: string
  currentRole: string
  isSimulating: boolean
}

export default function RoleSwitcher({ actualRole, currentRole, isSimulating }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Solo mostrar para el Director General (actualRole === 'ADMIN')
  if (actualRole !== 'ADMIN') return null

  const handleSelectRole = (newRole: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    if (newRole === currentRole && !isPending) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      const res = await switchRole(newRole)
      setIsOpen(false)
      if (res.success) {
        window.location.href = '/dashboard'
      }
    })
  }

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Director General',
          shortLabel: 'Director',
          color: 'text-amber-400',
          bg: 'bg-amber-400/10 border-amber-400/30',
          icon: <ShieldCheck size={14} className="text-amber-400" />,
          desc: 'Gestión total, usuarios y expedición final',
        }
      case 'TEACHER':
        return {
          label: 'Vista de Maestro',
          shortLabel: 'Maestro',
          color: 'text-blue-400',
          bg: 'bg-blue-500/15 border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
          icon: <Users size={14} className="text-blue-400" />,
          desc: 'Calificar tareas, firmas y revisión de alumnos',
        }
      case 'STUDENT':
        return {
          label: 'Vista de Estudiante',
          shortLabel: 'Estudiante',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/15 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          icon: <GraduationCap size={14} className="text-emerald-400" />,
          desc: 'Campus, anatomía, exámenes y entregas',
        }
      default:
        return {
          label: 'Director',
          shortLabel: 'Director',
          color: 'text-white',
          bg: 'bg-white/10 border-white/20',
          icon: <ShieldCheck size={14} />,
          desc: '',
        }
    }
  }

  const currentCfg = getRoleConfig(currentRole)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Selección de Rol */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105 ${currentCfg.bg} ${
          isSimulating ? 'ring-2 ring-amber-400/60' : 'hover:bg-white/10'
        }`}
        title="Cambiar perspectiva de rol (Simulación para Director)"
      >
        <Eye size={14} className={isSimulating ? 'text-amber-400' : 'text-white/60'} />
        <span className="hidden sm:inline text-white/50 font-normal">Vista:</span>
        <span className={`${currentCfg.color} font-bold flex items-center gap-1`}>
          {currentCfg.shortLabel}
        </span>
        <ChevronDown size={13} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0d1527] border border-[#233554] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 z-50 animate-fade-in backdrop-blur-xl">
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> Modo Simulación
              </span>
              {isSimulating && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Explora la plataforma desde los ojos de cada usuario:
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            {/* Opción Director */}
            <button
              onClick={() => handleSelectRole('ADMIN')}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                currentRole === 'ADMIN' ? 'bg-amber-400/15 border border-amber-400/30' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Director General</span>
                  {currentRole === 'ADMIN' && <Check size={14} className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-white/40 leading-tight mt-0.5">
                  Panel maestro con gestión, métricas y expedición.
                </p>
              </div>
            </button>

            {/* Opción Maestro */}
            <button
              onClick={() => handleSelectRole('TEACHER')}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                currentRole === 'TEACHER' ? 'bg-blue-500/15 border border-blue-500/30' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                <Users size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Vista Maestro / Docente</span>
                  {currentRole === 'TEACHER' && <Check size={14} className="text-blue-400" />}
                </div>
                <p className="text-[11px] text-white/40 leading-tight mt-0.5">
                  Publicar y calificar tareas, firmas y revisión.
                </p>
              </div>
            </button>

            {/* Opción Estudiante */}
            <button
              onClick={() => handleSelectRole('STUDENT')}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                currentRole === 'STUDENT' ? 'bg-emerald-500/15 border border-emerald-500/30' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                <GraduationCap size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Vista Estudiante / Alumno</span>
                  {currentRole === 'STUDENT' && <Check size={14} className="text-emerald-400" />}
                </div>
                <p className="text-[11px] text-white/40 leading-tight mt-0.5">
                  Campus, laboratorio anatómico, exámenes y tareas.
                </p>
              </div>
            </button>
          </div>

          {isSimulating && (
            <div className="p-2 border-t border-white/10 mt-1">
              <button
                onClick={() => handleSelectRole('ADMIN')}
                className="w-full py-1.5 text-center text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 rounded-lg transition-colors"
              >
                Salir de simulación y volver a Director
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
