'use client';

import { useState } from 'react';
import { Award, Download, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { generateCertificatePDF } from '@/lib/pdfGenerator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  exam: { title: string; category?: { name: string } | null } | null;
  attempt: { score_percentage: number | null } | null;
}

interface ProgressViewProps {
  data: {
    profile: { full_name: string; email: string } | null;
    avgScore: number;
    totalAttempts: number;
    passedCount: number;
    certificatesCount: number;
    attemptsHistory: Array<{ score_percentage: number | null; submitted_at: string | null }>;
    certificates: Certificate[];
    categoryProgress: Array<any>;
  } | null;
}

export default function ProgressView({ data }: ProgressViewProps) {
  // Track loading state per certificate to avoid double-clicks
  const [loadingCertId, setLoadingCertId] = useState<string | null>(null);

  const historyLabels = data?.attemptsHistory?.map((_, idx) => `Examen ${idx + 1}`) ?? ['Sin datos'];
  const historyScores = data?.attemptsHistory?.map((a) => Number(a.score_percentage) || 0) ?? [0];

  const chartData = {
    labels: historyLabels.length > 0 ? historyLabels : ['Inicio'],
    datasets: [
      {
        label: 'Calificación (%)',
        data: historyScores.length > 0 ? historyScores : [0],
        borderColor: '#f2c400',
        backgroundColor: 'rgba(242, 196, 0, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' },
      },
    },
  };

  const handleDownloadCertificate = async (cert: Certificate) => {
    if (loadingCertId) return; // prevent concurrent downloads
    setLoadingCertId(cert.id);
    try {
      await generateCertificatePDF({
        studentName: data?.profile?.full_name ?? 'Estudiante',
        examTitle: cert.exam?.title ?? 'Examen de Radiología',
        categoryName: cert.exam?.category?.name ?? 'Radiología',
        score: Math.round(Number(cert.attempt?.score_percentage) || 0),
        certificateNumber: cert.certificate_number,
        issuedAt: cert.issued_at,
      });
    } catch (err) {
      console.error('Error generando el certificado PDF:', err);
      alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setLoadingCertId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <TrendingUp className="text-brand-accent" />
          Mi Progreso y Certificados
        </h1>
        <p className="text-brand-muted text-sm">Rastrea tu evolución y descarga tus logros académicos.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-dark to-brand-gray border border-brand-border rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-brand-muted text-sm font-medium mb-1">Promedio Actual</p>
            <h2 className="text-4xl font-bold text-brand-accent">{data?.avgScore ?? 0}%</h2>
          </div>
          <Activity size={100} className="absolute right-[-20px] bottom-[-20px] text-brand-accent opacity-10" />
        </div>
        <div className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-brand-muted text-sm font-medium mb-1">Exámenes Aprobados</p>
          <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{data?.passedCount ?? 0} / {data?.totalAttempts ?? 0}</h2>
        </div>
        <div className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-brand-muted text-sm font-medium mb-1">Certificados Obtenidos</p>
          <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{data?.certificatesCount ?? 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-brand-dark border border-brand-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Evolución del Aprendizaje</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
            <Award className="text-brand-accent" /> Mis Certificados
          </h3>

          <div className="space-y-4">
            {data?.certificates && data.certificates.length > 0 ? (
              data.certificates.map((cert) => {
                const isLoading = loadingCertId === cert.id;
                return (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-white dark:bg-brand-dark hover:border-brand-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-brand-dark dark:text-white truncate">
                        {cert.exam?.title ?? 'Certificado de Aprobación'}
                      </h4>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-brand-muted">
                        <span>N.° {cert.certificate_number}</span>
                        <span>•</span>
                        <span>{new Date(cert.issued_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        {cert.attempt?.score_percentage && (
                          <>
                            <span>•</span>
                            <span className="text-green-500 font-semibold">
                              {Math.round(Number(cert.attempt.score_percentage))}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCertificate(cert)}
                      disabled={!!loadingCertId}
                      title="Descargar certificado en PDF"
                      className="ml-4 p-3 bg-brand-accent/10 text-brand-accent-dark hover:bg-brand-accent hover:text-brand-dark rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(242,196,0,0.3)]"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 space-y-3">
                <Award size={40} className="mx-auto text-brand-muted opacity-30" />
                <p className="text-brand-muted text-sm">
                  Aún no tienes certificados.<br />
                  Aprueba exámenes con más del <strong>70%</strong> para obtenerlos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
