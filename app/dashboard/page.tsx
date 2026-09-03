import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  Users,
  FileText,
  BarChart2,
  Library,
  Sparkles,
  UserCog,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/actions/auth';
import { getStudentDashboardData } from '@/actions/student';
import { getTeacherStats } from '@/actions/teacher';
import { redirect } from 'next/navigation';

// ─── Teacher / Admin Dashboard ────────────────────────────────────────────────

async function TeacherDashboard({ user }: { user: any }) {
  const stats = await getTeacherStats();
  const isAdmin = user.role === 'ADMIN';

  const kpis = [
    { name: 'Estudiantes Activos', value: String(stats.totalStudents), icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { name: 'Evaluaciones Completadas', value: String(stats.totalAttempts), icon: BookOpen, color: 'bg-purple-500/10 text-purple-500' },
    { name: 'Promedio Global', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
    { name: 'Tasa de Aprobación', value: `${stats.passRate}%`, icon: Award, color: 'bg-brand-accent/20 text-brand-accent-dark' },
    { name: 'Preguntas en Banco', value: String(stats.totalQuestions), icon: FileText, color: 'bg-orange-500/10 text-orange-500' },
    { name: 'Exámenes Publicados', value: String(stats.publishedExams), icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-500' },
  ];

  const quickLinks = [
    ...(isAdmin
      ? [{ name: 'Control de Usuarios', href: '/dashboard/users', icon: UserCog, desc: 'Aprobar maestros y gestionar permisos' }]
      : []),
    { name: 'Laboratorio de Anatomía', href: '/dashboard/anatomy-lab', icon: Sparkles, desc: 'Simulador radiológico interactivo' },
    { name: 'Banco de Preguntas', href: '/dashboard/questions', icon: FileText, desc: 'Crear y editar preguntas médicas' },
    { name: 'Gestión de Exámenes', href: '/dashboard/exams', icon: BookOpen, desc: 'Configurar evaluaciones y tiempos' },
    { name: 'Categorías Médicas', href: '/dashboard/categories', icon: Library, desc: 'Organizar materias y especialidades' },
    { name: 'Analíticas y Rendimiento', href: '/dashboard/analytics', icon: BarChart2, desc: 'Seguimiento por alumno y examen' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-dark to-brand-gray rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-brand-border/60">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              {isAdmin ? <ShieldCheck size={14} /> : null}
              {isAdmin ? 'Dirección General de Radiología con Fe' : 'Panel Docente'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            {isAdmin ? `¡Bienvenido Director ${user.full_name}!` : `¡Bienvenido, ${user.full_name}!`}
          </h1>
          <p className="text-brand-muted max-w-xl text-sm sm:text-base leading-relaxed">
            {isAdmin
              ? 'Control total de la plataforma: gestión de docentes, banco de preguntas, exámenes, analíticas y laboratorio interactivo.'
              : 'Gestiona tus evaluaciones, revisa el progreso de los alumnos y accede al laboratorio anatómico.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {isAdmin && (
              <Link
                href="/dashboard/users"
                className="bg-brand-accent text-brand-dark font-bold px-6 py-3 rounded-xl hover:bg-brand-accent-light transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,196,0,0.4)]"
              >
                <UserCog size={18} />
                Control de Usuarios y Maestros
              </Link>
            )}
            <Link
              href="/dashboard/anatomy-lab"
              className="bg-[#16191e] border border-brand-border text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-gray transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="text-brand-accent" />
              Laboratorio de Anatomía
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.name} className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-5 flex items-center gap-3 hover:shadow-lg transition-shadow">
              <div className={`p-3 rounded-xl ${kpi.color} shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-brand-muted font-medium truncate">{kpi.name}</p>
                <p className="text-xl font-bold text-brand-dark dark:text-white">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Herramientas y Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6 hover:border-brand-accent hover:shadow-[0_0_20px_rgba(242,196,0,0.1)] transition-all duration-200 flex flex-col gap-3"
              >
                <div className="p-3 rounded-xl bg-brand-accent/10 w-fit group-hover:bg-brand-accent transition-colors duration-200">
                  <Icon size={20} className="text-brand-accent group-hover:text-brand-dark transition-colors duration-200" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark dark:text-white group-hover:text-brand-accent transition-colors">{link.name}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

async function StudentDashboard({ user }: { user: any }) {
  const data = await getStudentDashboardData();

  const userName = user?.full_name || data?.profile?.full_name || 'Estudiante';
  const stats = [
    { name: 'Exámenes Completados', value: String(data?.stats.completedExams ?? 0), icon: BookOpen, color: 'bg-blue-500/10 text-blue-500' },
    { name: 'Promedio General', value: data?.stats.avgScore ?? '0%', icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
    { name: 'Certificados', value: String(data?.stats.certificatesCount ?? 0), icon: Award, color: 'bg-brand-accent/20 text-brand-accent-dark' },
    { name: 'Horas de Estudio', value: data?.stats.studyHours ?? '0h', icon: Clock, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const nextExam = data?.availableExams?.[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-dark to-brand-gray rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-brand-border/60">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent font-bold text-xs uppercase tracking-wider inline-block mb-3">
            Campus de Aprendizaje Médico
          </span>
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta, {userName}!</h1>
          <p className="text-brand-muted max-w-xl text-sm sm:text-base">
            Continúa tu formación en Radiología Médica. Accede a las evaluaciones oficiales y practica en el laboratorio interactivo.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {nextExam && (
              <Link
                href={`/exam/${nextExam.id}`}
                className="bg-brand-accent text-brand-dark font-bold px-6 py-3 rounded-xl hover:bg-brand-accent-light transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,196,0,0.4)]"
              >
                <PlayCircle size={20} />
                Comenzar Evaluación
              </Link>
            )}
            <Link
              href="/dashboard/anatomy-lab"
              className="bg-[#16191e] border border-brand-border text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-gray transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="text-brand-accent" />
              Laboratorio de Anatomía
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-brand-muted dark:text-gray-400 font-medium">{stat.name}</p>
              <p className="text-2xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Next Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-dark dark:text-white">Progreso Reciente</h2>
            <Link href="/dashboard/student/progress" className="text-sm text-brand-accent font-medium hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="space-y-4">
            {data?.recentAttempts && data.recentAttempts.length > 0 ? (
              data.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 rounded-xl border border-brand-border/50 hover:bg-brand-white dark:hover:bg-brand-dark/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-gray-light flex items-center justify-center text-brand-accent">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark dark:text-white">{(attempt.exam as any)?.title ?? 'Examen'}</h3>
                      <p className="text-xs text-brand-muted">
                        {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString('es-ES') : 'Reciente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      attempt.is_passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {attempt.is_passed ? 'Aprobado' : 'No Aprobado'} ({attempt.score_percentage}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-muted text-sm py-4 text-center">No has completado ningún examen todavía.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-6">Exámenes Disponibles</h2>
          <div className="space-y-4">
            {data?.availableExams && data.availableExams.length > 0 ? (
              data.availableExams.slice(0, 3).map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-brand-white dark:bg-brand-dark border border-brand-border">
                  <h3 className="font-semibold text-brand-dark dark:text-white mb-1">{ex.title}</h3>
                  <p className="text-xs text-brand-muted mb-3">
                    {ex.question_count} Preguntas • {ex.time_limit_minutes ? `${ex.time_limit_minutes} mins` : 'Sin límite'}
                  </p>
                  <Link
                    href={`/exam/${ex.id}`}
                    className="block text-center w-full py-2 bg-brand-gray-light text-white text-sm font-medium rounded-lg hover:bg-brand-accent hover:text-brand-dark transition-colors"
                  >
                    Iniciar
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-brand-muted text-sm py-4 text-center">No hay exámenes disponibles en este momento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Entry: role-based routing ──────────────────────────────────────────

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'TEACHER' || user.role === 'ADMIN') {
    return <TeacherDashboard user={user} />;
  }

  return <StudentDashboard user={user} />;
}
