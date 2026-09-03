import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { getCurrentUser, switchRole } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { Eye, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const roleName = user.role === 'TEACHER' ? 'Maestro / Docente' : user.role === 'STUDENT' ? 'Estudiante / Alumno' : 'Director General';

  return (
    <div className="flex h-screen overflow-hidden bg-[#070c18] text-white flex-col">
      {/* Banner de Simulación de Rol para Director */}
      {user.is_simulating && (
        <div className="bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-emerald-500/20 border-b border-amber-400/30 px-6 py-2 flex items-center justify-between text-xs z-50 animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <Eye size={15} className="text-amber-400" />
            <span className="text-white/80">
              <strong className="text-amber-300">Modo Simulación de Director:</strong> Estás previsualizando la plataforma como <strong className="text-white underline">{roleName}</strong>.
            </span>
          </div>
          <form action={async () => {
            'use server'
            await switchRole('ADMIN')
            redirect('/dashboard')
          }}>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] shadow-sm"
            >
              <ArrowLeft size={12} />
              Volver a Director General
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={user.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            userName={user.full_name}
            role={user.role}
            actualRole={user.actual_role || user.role}
            isSimulating={user.is_simulating || false}
            avatarUrl={user.avatar_url}
          />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
