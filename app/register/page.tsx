"use client"
import { useFormState } from "react-dom"
import { registerStudent } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { UserCheck, GraduationCap, ShieldCheck } from "lucide-react"

const initialState = {
  error: null as string | null,
  success: false,
  message: undefined as string | undefined,
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerStudent as any, initialState)
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/login")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-dark relative overflow-hidden py-12">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-[#111214] border border-brand-border p-8 md:p-10 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-5 inline-block group">
            <Image
              src="/logo.png"
              alt="Radiología con Fe"
              width={280}
              height={100}
              className="h-24 md:h-28 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(245,158,11,0.65)] group-hover:drop-shadow-[0_0_45px_rgba(245,158,11,0.9)]"
              priority
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Registro en Plataforma</h1>
          <p className="text-brand-muted text-sm">Únete a la comunidad de excelencia médica en Radiología con Fe</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-brand-error/10 border border-brand-error text-brand-error p-4 rounded-xl text-sm text-center font-medium">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-xl text-sm text-center font-medium">
              {state.message || "¡Registro exitoso! Redirigiendo al inicio de sesión..."}
            </div>
          )}

          {/* Selector de Tipo de Cuenta */}
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-brand-muted block mb-2">
              Tipo de Registro
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('STUDENT')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  selectedRole === 'STUDENT'
                    ? 'border-brand-accent bg-brand-accent/10 text-white font-bold'
                    : 'border-brand-border bg-brand-gray/30 text-brand-muted hover:text-white'
                }`}
              >
                <GraduationCap className={selectedRole === 'STUDENT' ? 'text-brand-accent' : 'text-brand-muted'} size={20} />
                <div>
                  <p className="text-sm">Estudiante</p>
                  <p className="text-[11px] text-brand-muted">Acceso a exámenes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('TEACHER')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                  selectedRole === 'TEACHER'
                    ? 'border-brand-accent bg-brand-accent/10 text-white font-bold'
                    : 'border-brand-border bg-brand-gray/30 text-brand-muted hover:text-white'
                }`}
              >
                <ShieldCheck className={selectedRole === 'TEACHER' ? 'text-brand-accent' : 'text-brand-muted'} size={20} />
                <div>
                  <p className="text-sm">Docente / Maestro</p>
                  <p className="text-[11px] text-brand-muted">Aprobación de Dirección</p>
                </div>
              </button>
            </div>
            <input type="hidden" name="requested_role" value={selectedRole} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              required
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="Dr. / Lic. / Est. Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Correo electrónico *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Contraseña *</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white block">Institución / Hospital</label>
              <input
                type="text"
                name="institution"
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
                placeholder="Universidad / Centro Médico"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white block">Nivel / Especialidad</label>
              <select
                name="academic_level"
                className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
              >
                <option value="">Selecciona...</option>
                <option value="ESTUDIANTE">Estudiante de Radiología</option>
                <option value="TECNICO">Técnico Radiólogo</option>
                <option value="LICENCIADO">Licenciado en Bioimagen</option>
                <option value="MEDICO">Médico Residente / Especialista</option>
                <option value="DOCENTE">Docente Universitario</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">País</label>
            <input
              type="text"
              name="country"
              className="w-full bg-[#1a1d21] border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="Ej. República Dominicana, México..."
            />
          </div>

          {selectedRole === 'TEACHER' && (
            <div className="p-3 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-xs text-brand-muted flex items-start gap-2">
              <ShieldCheck className="text-brand-accent shrink-0 mt-0.5" size={16} />
              <span>
                Las cuentas docentes son revisadas y activadas por el <strong>Director Francisco Jáquez</strong> para habilitar las herramientas de gestión de exámenes y banco de preguntas.
              </span>
            </div>
          )}

          <Button type="submit" className="w-full text-base h-12 mt-2 shadow-[0_0_20px_rgba(242,196,0,0.3)]">
            {selectedRole === 'TEACHER' ? 'Solicitar Cuenta Docente' : 'Completar Registro'}
          </Button>
        </form>

        <div className="mt-6 text-center text-brand-muted text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-brand-accent hover:underline font-bold">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
