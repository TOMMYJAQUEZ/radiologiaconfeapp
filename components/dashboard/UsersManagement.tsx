'use client'

import { useState, useTransition } from 'react'
import {
  Users, ShieldCheck, GraduationCap, CheckCircle2,
  XCircle, Search, Filter, AlertCircle, UserCog, UserCheck,
  UserX, Trash2, ChevronDown, Crown, BookOpen, Shield
} from 'lucide-react'
import { updateUserRole, toggleUserActive, approveTeacherRequest, rejectTeacherRequest, deleteUser } from '@/actions/admin'
import type { UserRole } from '@/types'

interface UserItem {
  id: string
  full_name: string
  email: string
  role: UserRole
  institution: string | null
  academic_level: string | null
  country: string | null
  is_active: boolean
  created_at: string
  attemptsCount: number
  certificatesCount: number
}

interface UsersManagementProps {
  initialUsers: UserItem[]
  currentAdminName: string
}

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Director / Admin',
    bg: 'bg-brand-accent/20 text-brand-accent border-brand-accent/40',
    icon: Crown,
  },
  TEACHER: {
    label: 'Maestro',
    bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    icon: BookOpen,
  },
  STUDENT: {
    label: 'Estudiante',
    bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    icon: GraduationCap,
  },
}

export default function UsersManagement({ initialUsers, currentAdminName }: UsersManagementProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<UserItem | null>(null)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // ── ACEPTAR COMO MAESTRO ─────────────────────────────────
  const handleApprove = (user: UserItem) => {
    setLoadingUserId(user.id)
    startTransition(async () => {
      const res = await approveTeacherRequest(user.id)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'TEACHER' } : u))
        showMsg('success', `✅ ${user.full_name} ahora es Maestro/Docente.`)
      }
      setLoadingUserId(null)
    })
  }

  // ── NO ACEPTAR / RECHAZAR → BAJAR A ESTUDIANTE ──────────
  const handleReject = (user: UserItem) => {
    setLoadingUserId(user.id)
    startTransition(async () => {
      const res = await rejectTeacherRequest(user.id)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'STUDENT' } : u))
        showMsg('success', `⚠️ ${user.full_name} ha sido bajado a Estudiante.`)
      }
      setLoadingUserId(null)
    })
  }

  // ── ELIMINAR USUARIO ─────────────────────────────────────
  const handleDelete = (user: UserItem) => {
    setConfirmDelete(user)
  }

  const confirmDeleteUser = () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setConfirmDelete(null)
    setLoadingUserId(target.id)
    startTransition(async () => {
      const res = await deleteUser(target.id)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setUsers(prev => prev.filter(u => u.id !== target.id))
        showMsg('success', `🗑️ ${target.full_name} ha sido eliminado de la plataforma.`)
      }
      setLoadingUserId(null)
    })
  }

  // ── CAMBIAR ROL DIRECTO ──────────────────────────────────
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setLoadingUserId(userId)
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        showMsg('success', `Rol actualizado a ${newRole} exitosamente.`)
      }
      setLoadingUserId(null)
    })
  }

  // ── ACTIVAR / DESACTIVAR ─────────────────────────────────
  const handleToggleActive = (user: UserItem) => {
    setLoadingUserId(user.id)
    startTransition(async () => {
      const res = await toggleUserActive(user.id, !user.is_active)
      if (res?.error) {
        showMsg('error', res.error)
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u))
        showMsg('success', `Estado de ${user.full_name} actualizado.`)
      }
      setLoadingUserId(null)
    })
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.institution?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalTeachers = users.filter(u => u.role === 'TEACHER').length
  const totalStudents = users.filter(u => u.role === 'STUDENT').length
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Modal de Confirmación de Eliminación ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111214] border border-red-500/40 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(220,38,38,0.2)] animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Trash2 className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirmar Eliminación</h3>
                <p className="text-xs text-brand-muted">Esta acción es irreversible</p>
              </div>
            </div>
            <p className="text-sm text-brand-muted mb-1">¿Estás seguro de que deseas eliminar permanentemente la cuenta de:</p>
            <p className="text-base font-bold text-white mb-1">{confirmDelete.full_name}</p>
            <p className="text-xs text-brand-muted mb-6">{confirmDelete.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted transition-colors text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                <Trash2 size={16} /> Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-dark border border-brand-border p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent/20 text-brand-accent">
              Panel Exclusivo del Director
            </span>
            <span className="text-xs text-brand-muted">— {currentAdminName}</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="text-brand-accent" size={26} />
            Control de Usuarios y Aprobación de Maestros
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Aprueba solicitudes de docentes, asigna roles y gestiona el acceso a la plataforma.
          </p>
        </div>
      </div>

      {/* ── Alerta de Mensaje ── */}
      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border animate-fade-in ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-300'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* ── KPI Contadores ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Maestros / Docentes', count: totalTeachers, Icon: ShieldCheck, color: 'purple' },
          { label: 'Estudiantes Registrados', count: totalStudents, Icon: GraduationCap, color: 'blue' },
          { label: 'Directores / Admins', count: totalAdmins, Icon: Shield, color: 'yellow' },
        ].map(({ label, count, Icon, color }) => (
          <div key={label} className="bg-brand-dark border border-brand-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              color === 'purple' ? 'bg-purple-500/10 text-purple-400'
              : color === 'blue' ? 'bg-blue-500/10 text-blue-400'
              : 'bg-brand-accent/10 text-brand-accent'
            }`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs text-brand-muted font-medium">{label}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Barra de Búsqueda y Filtros ── */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o institución..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1d21] border border-brand-border rounded-xl text-white focus:outline-none focus:border-brand-accent transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
          <span className="text-xs font-medium text-brand-muted flex items-center gap-1 shrink-0">
            <Filter size={14} /> Filtrar:
          </span>
          {(['ALL', 'TEACHER', 'STUDENT', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                roleFilter === role
                  ? 'bg-brand-accent text-brand-dark shadow-[0_0_12px_rgba(242,196,0,0.4)]'
                  : 'bg-[#1a1d21] border border-brand-border text-brand-muted hover:text-white'
              }`}
            >
              {role === 'ALL' ? 'Todos' : role === 'TEACHER' ? 'Maestros' : role === 'STUDENT' ? 'Estudiantes' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla de Usuarios ── */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0f1115] border-b border-brand-border text-brand-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4 hidden md:table-cell">Institución / Nivel</th>
                <th className="px-5 py-4 text-center">Rol Actual</th>
                <th className="px-5 py-4 text-center hidden lg:table-cell">Exámenes / Certs</th>
                <th className="px-5 py-4 text-center">Estado</th>
                <th className="px-5 py-4 text-center">Acciones de Dirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredUsers.map((u) => {
                const roleConf = ROLE_CONFIG[u.role]
                const RoleIcon = roleConf.icon
                const isLoading = loadingUserId === u.id && isPending

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-white/[0.02]'}`}
                  >
                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gray border border-brand-border flex items-center justify-center font-bold text-brand-accent text-base flex-shrink-0">
                          {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{u.full_name}</p>
                          <p className="text-xs text-brand-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Institución */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-white text-xs font-medium">{u.institution || '—'}</p>
                      <p className="text-brand-muted text-[11px]">{u.academic_level || 'General'} · {u.country || '—'}</p>
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${roleConf.bg}`}>
                        <RoleIcon size={12} />
                        {roleConf.label}
                      </span>
                    </td>

                    {/* Stats */}
                    <td className="px-5 py-4 text-center hidden lg:table-cell">
                      <p className="text-white font-medium text-xs">{u.attemptsCount} exámenes</p>
                      <p className="text-brand-muted text-[11px]">{u.certificatesCount} certificados</p>
                    </td>

                    {/* Estado Activo/Inactivo */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={isPending}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          u.is_active
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {u.is_active ? '● Activo' : '○ Inactivo'}
                      </button>
                    </td>

                    {/* ── ACCIONES DE DIRECCIÓN ── */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center flex-wrap gap-2">

                        {/* === FLUJO: solicitud de Maestro (actualmente STUDENT) === */}
                        {u.role === 'STUDENT' && (
                          <button
                            onClick={() => handleApprove(u)}
                            disabled={isPending}
                            title="Aprobar y promover a Maestro/Docente"
                            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <UserCheck size={13} />
                            Aceptar Maestro
                          </button>
                        )}

                        {/* === FLUJO: revocar rol de Maestro (actualmente TEACHER) === */}
                        {u.role === 'TEACHER' && (
                          <>
                            <button
                              onClick={() => handleReject(u)}
                              disabled={isPending}
                              title="No Aceptar / Revocar rol de Maestro → Bajar a Estudiante"
                              className="px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <UserX size={13} />
                              No Aceptar
                            </button>
                            <button
                              onClick={() => handleReject(u)}
                              disabled={isPending}
                              title="Eliminar rol de Maestro → Bajar a Estudiante"
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <XCircle size={13} />
                              Quitar Rol
                            </button>
                          </>
                        )}

                        {/* Selector de rol rápido (solo para no-ADMIN) */}
                        {u.role !== 'ADMIN' && (
                          <div className="relative">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              disabled={isPending}
                              className="appearance-none bg-[#1a1d21] border border-brand-border text-white text-xs rounded-lg pl-2.5 pr-6 py-1.5 focus:outline-none focus:border-brand-accent cursor-pointer transition-colors"
                            >
                              <option value="STUDENT">→ Estudiante</option>
                              <option value="TEACHER">→ Maestro</option>
                              <option value="ADMIN">→ Director</option>
                            </select>
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                          </div>
                        )}

                        {/* Botón ELIMINAR (no aplica al propio admin) */}
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={isPending}
                            title="Eliminar usuario permanentemente"
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-brand-muted">
                      <Users size={40} className="opacity-20" />
                      <p className="font-medium">No se encontraron usuarios con ese criterio.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con total */}
        <div className="px-5 py-3 border-t border-brand-border bg-[#0f1115] flex items-center justify-between text-xs text-brand-muted">
          <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
          <span className="text-brand-accent font-semibold">Radiología con Fe — Panel de Dirección</span>
        </div>
      </div>
    </div>
  )
}
