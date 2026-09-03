"use client"
import { useFormState } from "react-dom"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const initialState = {
  error: null as string | null,
  success: false,
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login as any, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state?.success, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-dark relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-[#111214] border border-brand-border p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 inline-block group">
            <Image
              src="/logo.png"
              alt="Radiología con Fe"
              width={280}
              height={100}
              className="h-24 md:h-28 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(245,158,11,0.65)] group-hover:drop-shadow-[0_0_45px_rgba(245,158,11,0.9)]"
              priority
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Bienvenido de nuevo</h1>
          <p className="text-brand-muted">Ingresa tus credenciales para continuar</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-brand-error/10 border border-brand-error text-brand-error p-3 rounded-lg text-sm text-center">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg text-sm text-center">
              ¡Sesión iniciada! Redirigiendo...
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Correo electrónico</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="estudiante@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white block">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full bg-[#1a1d21] border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-muted"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full text-base h-12 shadow-[0_0_20px_rgba(242,196,0,0.2)]">
            Iniciar sesión
          </Button>
        </form>

        <div className="mt-6 text-center text-brand-muted text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="text-brand-accent hover:underline font-bold">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
