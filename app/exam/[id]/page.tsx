import { startExam, getActiveAttempt } from '@/actions/exams';
import ExamSimulator from '@/components/exam/ExamSimulator';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default async function ExamPage({ params }: { params: { id: string } }) {
  // Iniciar o recuperar intento
  const startRes = await startExam(params.id);

  if (!startRes || startRes.error || !startRes.attemptId) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-6 text-white text-center">
        <div className="bg-[#16191e] border border-brand-border rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Evaluación no disponible</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {startRes?.error?.includes('suficientes preguntas') 
                ? 'Esta evaluación aún no cuenta con preguntas suficientes publicadas en el banco. Por favor intenta más tarde o comunícate con tu docente.' 
                : (startRes?.error || 'No fue posible inicializar la evaluación.')}
            </p>
          </div>
          <Link
            href="/dashboard/student/exams"
            className="inline-flex items-center justify-center w-full bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(242,196,0,0.2)] text-sm"
          >
            Volver a Mis Exámenes
          </Link>
        </div>
      </div>
    );
  }

  // Obtener preguntas e intento activo
  const attempt = await getActiveAttempt(startRes.attemptId);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-6 text-white text-center">
        <div className="bg-[#16191e] border border-brand-border rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Intento Finalizado</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              Este intento de evaluación ya ha sido completado y calificado.
            </p>
          </div>
          <Link
            href="/dashboard/student/exams"
            className="inline-flex items-center justify-center w-full bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(242,196,0,0.2)] text-sm"
          >
            Volver a Mis Exámenes
          </Link>
        </div>
      </div>
    );
  }

  return <ExamSimulator initialAttempt={attempt} />;
}
