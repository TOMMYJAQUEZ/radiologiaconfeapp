'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { logout } from '@/actions/auth';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  FileText, 
  Award,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  UserCog,
  Video,
  PenLine,
  ScrollText
} from 'lucide-react';
import { useState } from 'react';

const studentLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clases Pre-grabadas', href: '/dashboard/student/lessons', icon: Video },
  { name: 'Laboratorio de Anatomía', href: '/dashboard/anatomy-lab', icon: Sparkles },
  { name: 'Mis Exámenes', href: '/dashboard/student/exams', icon: BookOpen },
  { name: 'Mis Tareas', href: '/dashboard/student/assignments', icon: ScrollText },
  { name: 'Mi Progreso', href: '/dashboard/student/progress', icon: Award },
];

const teacherLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clases Pre-grabadas', href: '/dashboard/lessons', icon: Video },
  { name: 'Laboratorio de Anatomía', href: '/dashboard/anatomy-lab', icon: Sparkles },
  { name: 'Banco de Preguntas', href: '/dashboard/questions', icon: FileText },
  { name: 'Exámenes', href: '/dashboard/exams', icon: BookOpen },
  { name: 'Tareas', href: '/dashboard/assignments', icon: ScrollText },
  { name: 'Certificados', href: '/dashboard/certificates', icon: Award },
  { name: 'Mi Firma', href: '/dashboard/teacher/signatures', icon: PenLine },
  { name: 'Categorías', href: '/dashboard/categories', icon: Library },
  { name: 'Analíticas', href: '/dashboard/analytics', icon: BarChart2 },
];

const adminLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Control de Usuarios', href: '/dashboard/users', icon: UserCog },
  { name: 'Clases Pre-grabadas', href: '/dashboard/lessons', icon: Video },
  { name: 'Laboratorio de Anatomía', href: '/dashboard/anatomy-lab', icon: Sparkles },
  { name: 'Banco de Preguntas', href: '/dashboard/questions', icon: FileText },
  { name: 'Exámenes', href: '/dashboard/exams', icon: BookOpen },
  { name: 'Tareas', href: '/dashboard/assignments', icon: ScrollText },
  { name: 'Certificados', href: '/dashboard/certificates', icon: Award },
  { name: 'Mi Firma (Director)', href: '/dashboard/teacher/signatures', icon: PenLine },
  { name: 'Categorías', href: '/dashboard/categories', icon: Library },
  { name: 'Analíticas', href: '/dashboard/analytics', icon: BarChart2 },
];

export default function Sidebar({ role = 'STUDENT' }: { role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const links =
    role === 'ADMIN'
      ? adminLinks
      : role === 'TEACHER'
      ? teacherLinks
      : studentLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand-dark rounded-md text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0a1122] text-white p-6 
        transition-transform duration-300 ease-in-out z-40
        flex flex-col border-r border-[#1e293b]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:flex-shrink-0
      `}>
        {/* Logo Oficial */}
        <div className="flex flex-col items-center gap-3 mb-6 mt-1">
          <Link href="/dashboard" className="block group w-full text-center">
            <Image
              src="/logo.png"
              alt="Radiología con Fe"
              width={260}
              height={120}
              className="h-24 w-auto mx-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_25px_rgba(245,158,11,0.65)]"
              priority
            />
          </Link>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
            <span className="text-[11px] text-brand-accent font-bold uppercase tracking-wider">
              {role === 'ADMIN' ? 'Dirección General' : role === 'TEACHER' ? 'Panel Docente' : 'Campus Estudiantil'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm
                  ${isActive 
                    ? 'bg-brand-accent text-brand-dark font-bold shadow-[0_0_15px_rgba(242,196,0,0.3)]' 
                    : 'text-brand-muted hover:text-white hover:bg-brand-gray-light font-medium'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className={isActive ? 'text-brand-dark' : link.name === 'Laboratorio de Anatomía' ? 'text-brand-accent' : ''} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-brand-border space-y-1.5">
          <Link 
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-brand-muted hover:text-white hover:bg-brand-gray-light text-sm"
          >
            <Settings size={18} />
            <span>Configuración</span>
          </Link>
          <button
            onClick={() => {
              startTransition(async () => {
                const res = await logout();
                if (res?.success) {
                  router.push('/');
                }
              });
            }}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-brand-error hover:bg-brand-error/10 disabled:opacity-50 text-sm"
          >
            <LogOut size={18} />
            <span>{isPending ? 'Saliendo...' : 'Cerrar Sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
