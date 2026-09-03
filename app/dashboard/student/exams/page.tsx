import { PlayCircle, Clock, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getStudentExams } from '@/actions/student';

export default async function StudentExamsPage() {
  const exams = await getStudentExams();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
          <BookOpen className="text-brand-accent" />
          Mis Exámenes
        </h1>
        <p className="text-brand-muted text-sm">Pruebas disponibles para evaluar tus conocimientos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white dark:bg-brand-gray border border-brand-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  exam.isCompleted 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-brand-accent/20 text-brand-accent-dark'
                }`}>
                  {exam.isCompleted ? <><CheckCircle size={14} /> Completado</> : 'Disponible'}
                </span>
                {exam.isCompleted && exam.lastScore !== null && (
                  <span className="font-bold text-brand-dark dark:text-white">{exam.lastScore}%</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">{exam.title}</h3>
              <p className="text-sm text-brand-muted mb-4">{exam.categoryName}</p>
              
              <div className="flex items-center gap-4 text-sm text-brand-muted">
                <div className="flex items-center gap-1">
                  <BookOpen size={16} className="text-brand-accent" />
                  <span>{exam.question_count} Preg.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-blue-500" />
                  <span>{exam.time_limit_minutes ? `${exam.time_limit_minutes} mins` : 'Sin límite'}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-brand-border bg-brand-white dark:bg-brand-dark mt-auto">
              <Link 
                href={`/exam/${exam.id}`}
                className="w-full bg-brand-accent text-brand-dark font-semibold px-4 py-2 rounded-xl hover:bg-brand-accent-light transition-colors flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} /> {exam.isCompleted ? 'Volver a Intentar' : 'Iniciar Examen'}
              </Link>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-brand-gray border border-brand-border rounded-2xl">
            <BookOpen size={48} className="mx-auto text-brand-muted mb-3 opacity-50" />
            <p className="text-brand-dark dark:text-white font-semibold">No hay exámenes disponibles en este momento</p>
            <p className="text-brand-muted text-sm mt-1">Los profesores publicarán nuevas evaluaciones pronto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
