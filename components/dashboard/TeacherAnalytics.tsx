'use client';

import { useState } from 'react';
import {
  Users, BookOpen, Award, TrendingUp, BarChart2,
  CheckCircle, Search, ChevronUp, ChevronDown, Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentRow {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  attempts: number;
  avgScore: number;
  passRate: number;
  lastAttempt: string | null;
  registeredAt: string;
}

interface AnalyticsData {
  globalStats: {
    totalStudents: number;
    totalAttempts: number;
    totalCerts: number;
    publishedExams: number;
    totalQuestions: number;
    avgScore: number;
    passRate: number;
  };
  monthlyTrend: { month: string; attempts: number; passed: number }[];
  examPerformance: { title: string; attempts: number; avgScore: number; passRate: number }[];
  studentsList: StudentRow[];
}

interface TeacherAnalyticsProps {
  data: AnalyticsData | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonth(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('es-ES', {
    month: 'short',
    year: '2-digit',
  });
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'text-green-400 bg-green-400/10' :
    score >= 70 ? 'text-yellow-400 bg-yellow-400/10' :
    'text-red-400 bg-red-400/10';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}%
    </span>
  );
}

type SortKey = keyof Pick<StudentRow, 'fullName' | 'attempts' | 'avgScore' | 'passRate' | 'lastAttempt'>;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherAnalytics({ data }: TeacherAnalyticsProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('avgScore');
  const [sortAsc, setSortAsc] = useState(false);

  const g = data?.globalStats;

  // ── KPI cards ──
  const kpis = [
    { label: 'Estudiantes', value: g?.totalStudents ?? 0, icon: Users, color: 'from-blue-600/20 to-blue-600/5', accent: '#60a5fa' },
    { label: 'Evaluaciones', value: g?.totalAttempts ?? 0, icon: BookOpen, color: 'from-purple-600/20 to-purple-600/5', accent: '#a78bfa' },
    { label: 'Certificados', value: g?.totalCerts ?? 0, icon: Award, color: 'from-brand-accent/20 to-brand-accent/5', accent: '#f2c400' },
    { label: 'Promedio Global', value: `${g?.avgScore ?? 0}%`, icon: TrendingUp, color: 'from-green-600/20 to-green-600/5', accent: '#4ade80' },
    { label: 'Tasa de Aprobación', value: `${g?.passRate ?? 0}%`, icon: CheckCircle, color: 'from-emerald-600/20 to-emerald-600/5', accent: '#34d399' },
    { label: 'Exámenes Activos', value: g?.publishedExams ?? 0, icon: Activity, color: 'from-orange-600/20 to-orange-600/5', accent: '#fb923c' },
  ];

  // ── Monthly trend chart ──
  const trendLabels = data?.monthlyTrend.map((m) => formatMonth(m.month)) ?? [];
  const trendData = {
    labels: trendLabels.length > 0 ? trendLabels : ['Sin datos'],
    datasets: [
      {
        label: 'Intentos',
        data: data?.monthlyTrend.map((m) => m.attempts) ?? [0],
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167,139,250,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#a78bfa',
      },
      {
        label: 'Aprobados',
        data: data?.monthlyTrend.map((m) => m.passed) ?? [0],
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74,222,128,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#4ade80',
      },
    ],
  };

  // ── Exam performance bar chart ──
  const examLabels = data?.examPerformance.map((e) => e.title) ?? [];
  const examChartData = {
    labels: examLabels.length > 0 ? examLabels : ['Sin datos'],
    datasets: [
      {
        label: 'Promedio (%)',
        data: data?.examPerformance.map((e) => e.avgScore) ?? [0],
        backgroundColor: 'rgba(242,196,0,0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Tasa Aprobación (%)',
        data: data?.examPerformance.map((e) => e.passRate) ?? [0],
        backgroundColor: 'rgba(74,222,128,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 11 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 } },
      },
    },
  };

  // ── Student table ──
  const filtered = (data?.studentsList ?? [])
    .filter((s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.institution.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
      : <ChevronDown size={14} className="opacity-30" />;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <BarChart2 className="text-brand-accent" />
          Panel de Analíticas
        </h1>
        <p className="text-brand-muted text-sm mt-1">
          Rendimiento global de la plataforma y seguimiento individual de estudiantes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`bg-gradient-to-br ${kpi.color} border border-brand-border rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200`}
            >
              <Icon size={20} style={{ color: kpi.accent }} />
              <div>
                <p className="text-brand-muted text-xs font-medium">{kpi.label}</p>
                <p className="text-2xl font-extrabold text-white mt-0.5">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Trend line — 3/5 width */}
        <div className="lg:col-span-3 bg-brand-dark border border-brand-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-1">Tendencia Mensual</h2>
          <p className="text-xs text-brand-muted mb-4">Intentos completados vs aprobados (últimos 6 meses)</p>
          <div className="h-56">
            <Line data={trendData} options={chartBaseOptions as any} />
          </div>
        </div>

        {/* Exam performance — 2/5 width */}
        <div className="lg:col-span-2 bg-brand-dark border border-brand-border rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-1">Rendimiento por Examen</h2>
          <p className="text-xs text-brand-muted mb-4">Promedio y tasa de aprobación (top 8)</p>
          <div className="h-56">
            <Bar data={examChartData} options={{ ...chartBaseOptions as any, indexAxis: 'y' }} />
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="bg-brand-dark border border-brand-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-brand-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-brand-accent" />
              Directorio de Estudiantes
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {filtered.length} de {data?.studentsList.length ?? 0} estudiantes
            </p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o institución…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-sm bg-brand-gray border border-brand-border rounded-xl text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted uppercase tracking-wide border-b border-brand-border">
                <th
                  className="px-6 py-3 cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort('fullName')}
                >
                  <span className="flex items-center gap-1">Estudiante <SortIcon k="fullName" /></span>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">Institución</th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none text-center"
                  onClick={() => handleSort('attempts')}
                >
                  <span className="flex items-center justify-center gap-1">Exámenes <SortIcon k="attempts" /></span>
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none text-center"
                  onClick={() => handleSort('avgScore')}
                >
                  <span className="flex items-center justify-center gap-1">Promedio <SortIcon k="avgScore" /></span>
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none text-center hidden lg:table-cell"
                  onClick={() => handleSort('passRate')}
                >
                  <span className="flex items-center justify-center gap-1">Aprobación <SortIcon k="passRate" /></span>
                </th>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none hidden xl:table-cell"
                  onClick={() => handleSort('lastAttempt')}
                >
                  <span className="flex items-center gap-1">Último Examen <SortIcon k="lastAttempt" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                    <Users size={36} className="mx-auto mb-3 opacity-20" />
                    {search ? 'No se encontraron estudiantes con ese criterio.' : 'No hay estudiantes registrados aún.'}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-brand-gray/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-gray border border-brand-border flex items-center justify-center text-brand-accent font-bold text-sm shrink-0">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate group-hover:text-brand-accent transition-colors">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-brand-muted truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-brand-muted text-xs hidden md:table-cell">
                      {student.institution}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {student.attempts > 0 ? (
                        <span className="font-semibold text-white">{student.attempts}</span>
                      ) : (
                        <span className="text-brand-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {student.attempts > 0 ? (
                        <ScoreBadge score={student.avgScore} />
                      ) : (
                        <span className="text-brand-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      {student.attempts > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-brand-gray rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-accent rounded-full transition-all"
                              style={{ width: `${student.passRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-brand-muted w-8 text-right">{student.passRate}%</span>
                        </div>
                      ) : (
                        <span className="text-brand-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-brand-muted text-xs hidden xl:table-cell">
                      {student.lastAttempt
                        ? new Date(student.lastAttempt).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
