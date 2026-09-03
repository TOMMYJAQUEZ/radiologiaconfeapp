'use client'

import { useState, useTransition, useRef } from 'react'
import { Settings, User, Building, MapPin, Phone, CheckCircle2, AlertCircle, Camera, Trash2, Upload, Sparkles } from 'lucide-react'
import { updateProfile, updateAvatar } from '@/actions/auth'
import type { Profile } from '@/types'
import { useRouter } from 'next/navigation'

interface SettingsViewProps {
  userProfile: Profile
}

export default function SettingsView({ userProfile }: SettingsViewProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(userProfile.full_name || '')
  const [institution, setInstitution] = useState(userProfile.institution || '')
  const [academicLevel, setAcademicLevel] = useState(userProfile.academic_level || '')
  const [country, setCountry] = useState(userProfile.country || '')
  const [phone, setPhone] = useState(userProfile.phone || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile.avatar_url || null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isAvatarPending, setIsAvatarPending] = useState(false)

  // Redimensionar imagen en el cliente para máxima velocidad y nitidez (300x300 px)
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const size = 320
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(event.target?.result as string)
            return
          }

          // Crop cuadrado centrado
          const minDim = Math.min(img.width, img.height)
          const sx = (img.width - minDim) / 2
          const sy = (img.height - minDim) / 2

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
          resolve(canvas.toDataURL('image/jpeg', 0.88))
        }
        img.onerror = reject
        img.src = event.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG o WEBP).' })
      return
    }

    try {
      setIsAvatarPending(true)
      const compressedB64 = await processImage(file)
      setAvatarUrl(compressedB64)

      const res = await updateAvatar(compressedB64)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: '¡Foto de perfil actualizada con éxito!' })
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'No se pudo procesar la imagen seleccionada.' })
    } finally {
      setIsAvatarPending(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsAvatarPending(true)
      const res = await updateAvatar(null)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setAvatarUrl(null)
        setMessage({ type: 'success', text: 'Foto de perfil eliminada.' })
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Error al eliminar la foto.' })
    } finally {
      setIsAvatarPending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const fd = new FormData()
      fd.append('full_name', fullName.trim())
      fd.append('institution', institution.trim())
      fd.append('academic_level', academicLevel.trim())
      fd.append('country', country.trim())
      fd.append('phone', phone.trim())
      if (avatarUrl) {
        fd.append('avatar_url', avatarUrl)
      }

      const res = await updateProfile(fd)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Datos de perfil actualizados con éxito.' })
        router.refresh()
      }
    })
  }

  const roleLabel =
    userProfile.role === 'ADMIN'
      ? 'Director General / Admin'
      : userProfile.role === 'TEACHER'
      ? 'Docente / Maestro'
      : 'Estudiante'

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <Settings className="text-brand-accent" />
          Personalización y Configuración de Perfil
        </h1>
        <p className="text-brand-muted text-sm mt-1">
          Personaliza tu foto de perfil, datos personales y afiliación institucional.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-brand-error/10 border border-brand-error text-brand-error'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info & Avatar Customizer Card */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Glow decorativo de fondo */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-accent/10 border-2 border-brand-accent/40 flex items-center justify-center font-bold text-3xl text-brand-accent overflow-hidden shadow-[0_0_25px_rgba(242,196,0,0.2)]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>

            {/* Camera badge / upload trigger button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAvatarPending}
              aria-label="Cambiar foto de perfil"
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-brand-accent text-brand-dark hover:bg-yellow-400 shadow-lg border-2 border-brand-dark transition-all transform hover:scale-110 disabled:opacity-50"
              title="Cambiar foto de perfil"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-white">{fullName || 'Usuario'}</h3>
              <Sparkles size={16} className="text-brand-accent" />
            </div>
            <p className="text-xs text-brand-muted">{userProfile.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                userProfile.role === 'ADMIN'
                  ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40'
                  : userProfile.role === 'TEACHER'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleAvatarFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAvatarPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent/15 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/25 transition-all text-xs font-bold disabled:opacity-50"
          >
            <Upload size={14} />
            {isAvatarPending ? 'Procesando...' : avatarUrl ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isAvatarPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold disabled:opacity-50"
              title="Eliminar foto de perfil"
            >
              <Trash2 size={14} />
              Quitar
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-brand-dark border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-brand-border pb-4">
          <User size={18} className="text-brand-accent" />
          Información Personal y Profesional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Nombre Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Correo Electrónico</label>
            <input
              type="email"
              disabled
              value={userProfile.email}
              className="w-full bg-[#16191e] border border-brand-border/50 rounded-xl px-4 py-3 text-brand-muted text-sm cursor-not-allowed"
            />
            <span className="text-[11px] text-brand-muted">El correo está vinculado a tu acceso seguro.</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block flex items-center gap-1.5">
              <Building size={16} className="text-brand-muted" /> Institución / Hospital
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Universidad o Centro Hospitalario..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Nivel / Especialidad</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent"
            >
              <option value="">Selecciona...</option>
              <option value="ESTUDIANTE">Estudiante de Radiología</option>
              <option value="TECNICO">Técnico Radiólogo</option>
              <option value="LICENCIADO">Licenciado en Bioimagen</option>
              <option value="MEDICO">Médico Residente / Especialista</option>
              <option value="DOCENTE">Docente Universitario</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block flex items-center gap-1.5">
              <MapPin size={16} className="text-brand-muted" /> País
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Ej. República Dominicana, México..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block flex items-center gap-1.5">
              <Phone size={16} className="text-brand-muted" /> Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 809..."
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-xl bg-brand-accent text-brand-dark hover:bg-brand-accent-light transition-all text-sm font-bold shadow-[0_0_15px_rgba(242,196,0,0.3)] disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

