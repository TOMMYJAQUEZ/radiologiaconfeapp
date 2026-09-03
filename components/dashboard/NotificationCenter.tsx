'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Bell, Check, CheckCheck, Clock, Award, ScrollText, BookOpen, AlertCircle, Info, ExternalLink } from 'lucide-react'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, type PlatformNotification } from '@/actions/notifications'
import { useRouter } from 'next/navigation'

export default function NotificationCenter() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<PlatformNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cargar notificaciones al montar y al abrir
  const loadNotifications = () => {
    startTransition(async () => {
      const res = await getUserNotifications()
      setNotifications(res.notifications || [])
      setUnreadCount(res.unreadCount || 0)
    })
  }

  useEffect(() => {
    loadNotifications()
    // Polling ligero cada 60s para mantener al estudiante al día
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleOpenToggle = () => {
    if (!isOpen) {
      loadNotifications()
    }
    setIsOpen(prev => !prev)
  }

  const handleNotificationClick = (n: PlatformNotification) => {
    // Marcar como leída localmente e invocar server action
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item))
    setUnreadCount(prev => Math.max(0, prev - 1))
    markNotificationAsRead(n.id)
    setIsOpen(false)
    if (n.url) {
      router.push(n.url)
    }
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, is_read: true })))
    setUnreadCount(0)
    markAllNotificationsAsRead()
  }

  const getNotificationIcon = (type: PlatformNotification['type']) => {
    switch (type) {
      case 'assignment':
        return <ScrollText size={16} className="text-amber-400" />
      case 'grade':
        return <Award size={16} className="text-emerald-400" />
      case 'certificate':
        return <Award size={16} className="text-amber-400" />
      case 'exam':
        return <BookOpen size={16} className="text-blue-400" />
      default:
        return <Info size={16} className="text-cyan-400" />
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={handleOpenToggle}
        aria-label="Abrir centro de notificaciones"
        className={`relative p-2.5 rounded-full transition-all ${
          isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-brand-muted hover:text-white'
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(242,196,0,0.5)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0a1122] border border-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-full text-[10px] font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-brand-accent hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck size={13} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-white/5 px-2 pt-2 bg-white/[0.02]">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                filter === 'all'
                  ? 'border-brand-accent text-white'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                filter === 'unread'
                  ? 'border-brand-accent text-white'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-white/30 px-4">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No tienes notificaciones {filter === 'unread' ? 'sin leer' : ''} en este momento.</p>
                <p className="text-[11px] text-white/20 mt-1">Te avisaremos cuando haya tareas, notas o certificados listos.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    !n.is_read
                      ? 'bg-amber-400/[0.06] hover:bg-amber-400/[0.12]'
                      : 'hover:bg-white/5 opacity-80'
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    !n.is_read ? 'bg-white/10 border border-white/10' : 'bg-white/5'
                  }`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${!n.is_read ? 'text-white' : 'text-white/70'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/30 mt-2">
                      <Clock size={10} />
                      <span>{new Date(n.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-white/[0.03] border-t border-white/10 text-center">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/student/assignments')
              }}
              className="text-xs text-brand-accent hover:underline font-semibold flex items-center justify-center gap-1.5 w-full py-1"
            >
              <span>Ver mis tareas y calificaciones</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
