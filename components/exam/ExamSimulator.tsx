'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Award, ListOrdered, CheckSquare2, Edit3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { saveAnswer, submitExam } from '@/actions/exams';
import type { ActiveAttempt, QuestionType } from '@/types';

interface ExamSimulatorProps {
  initialAttempt: ActiveAttempt;
}

export default function ExamSimulator({ initialAttempt }: ExamSimulatorProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAttempt.savedAnswers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ scorePercentage: number; isPassed: boolean } | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!initialAttempt.timeLimitMinutes) return null;
    const startTime = new Date(initialAttempt.startedAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const totalSeconds = initialAttempt.timeLimitMinutes * 60;
    return Math.max(0, totalSeconds - elapsedSeconds);
  });

  const questions = initialAttempt.questions;
  const currentQuestion = questions[currentQuestionIdx];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : null;
  const selectedOption = currentQuestion?.options.find(o => o.id === selectedOptionId);
  const progress = questions.length > 0 ? ((currentQuestionIdx + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    if (timeLeft === null || result || isSubmitting) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, result, isSubmitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = async (optionId: string) => {
    if (!currentQuestion || isSubmitting) return;

    // Actualización optimista local
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    // Guardar en el backend
    await saveAnswer(initialAttempt.attemptId, currentQuestion.id, optionId);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await submitExam(initialAttempt.attemptId);
    if (res && res.success) {
      setResult({
        scorePercentage: res.scorePercentage ?? 0,
        isPassed: res.isPassed ?? false,
      });
    }
    setIsSubmitting(false);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-6 animate-fade-in text-white">
        <div className="bg-[#16191e] border border-brand-border rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-brand-dark border border-brand-border">
            {result.isPassed ? (
              <CheckCircle2 size={48} className="text-green-500" />
            ) : (
              <XCircle size={48} className="text-brand-error" />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">
              {result.isPassed ? '¡Felicidades, Aprobaste!' : 'Examen Completado'}
            </h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              {result.isPassed
                ? 'Has alcanzado el puntaje requerido para esta evaluación de Radiología.'
                : 'No alcanzaste el porcentaje mínimo necesario. Puedes repasar los temas y volver a intentarlo.'}
            </p>
          </div>

          <div className="bg-brand-dark rounded-2xl p-6 border border-brand-border">
            <p className="text-brand-muted text-xs uppercase font-semibold mb-1">Calificación Obtenida</p>
            <p className={`text-5xl font-extrabold ${result.isPassed ? 'text-brand-accent' : 'text-brand-error'}`}>
              {result.scorePercentage}%
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {result.isPassed && (
              <Link
                href="/dashboard/student/progress"
                className="w-full bg-brand-accent text-brand-dark font-bold py-3.5 px-6 rounded-xl hover:bg-brand-accent-light transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,196,0,0.3)]"
              >
                <Award size={20} /> Ver Mis Certificados y Progreso
              </Link>
            )}
            <Link
              href="/dashboard/student/exams"
              className="w-full bg-[#1a1d21] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#22262c] transition-colors border border-brand-border"
            >
              Volver a Mis Evaluaciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 text-white text-center">
        <p className="text-brand-muted">No se encontraron preguntas en este examen.</p>
      </div>
    );
  }

  const qType = currentQuestion.question_type || 'multiple_choice';

  // Renderizador especial para preguntas de modalidad "Completa"
  const renderFillInTheBlankText = (text: string, currentSelectedText?: string) => {
    const blankRegex = /(\[_____\]|_____|___|\[\.\.\.\])/g;
    if (!blankRegex.test(text)) {
      return (
        <div className="space-y-3">
          <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
            <span className="text-brand-accent mr-3">{currentQuestionIdx + 1}.</span>
            {text}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-semibold">
            <span>Espacio a completar:</span>
            <span className="font-bold text-white bg-purple-900/50 px-3 py-0.5 rounded-lg border border-purple-500/40">
              {currentSelectedText || 'Selecciona una opción abajo...'}
            </span>
          </div>
        </div>
      );
    }

    const parts = text.split(blankRegex);
    return (
      <h2 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
        <span className="text-brand-accent mr-3">{currentQuestionIdx + 1}.</span>
        {parts.map((part, idx) => {
          if (blankRegex.test(part) || part === '[_____]' || part === '_____' || part === '___' || part === '[...]') {
            return (
              <span
                key={idx}
                className={`inline-block mx-2 px-3.5 py-1 rounded-xl border-2 transition-all font-bold text-lg md:text-xl shadow-lg ${
                  currentSelectedText
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 animate-pulse'
                    : 'bg-[#1a1d21] border-dashed border-purple-500/60 text-purple-300/60'
                }`}
              >
                {currentSelectedText || '___________'}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </h2>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d0f12]">
      {/* Top Header */}
      <header className="h-16 bg-[#16191e] border-b border-brand-border flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center font-bold text-brand-dark shadow-[0_0_10px_rgba(242,196,0,0.3)]">
            RF
          </div>
          <div>
            <h1 className="font-bold text-white text-sm md:text-base line-clamp-1">{initialAttempt.examTitle}</h1>
            <p className="text-xs text-brand-muted">
              Pregunta {currentQuestionIdx + 1} de {questions.length} • {initialAttempt.categoryName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 bg-[#121417] border px-4 py-2 rounded-xl font-mono text-sm md:text-base font-bold transition-colors ${
            timeLeft !== null && timeLeft < 120 
              ? 'border-red-500/50 text-red-400 animate-pulse' 
              : 'border-brand-border text-brand-accent shadow-[0_0_10px_rgba(242,196,0,0.15)]'
          }`}>
            <Clock size={18} />
            {timeLeft !== null ? formatTime(timeLeft) : 'Sin límite'}
          </div>

          <Link
            href="/dashboard/student/exams"
            className="hidden md:flex items-center gap-2 text-brand-muted hover:text-brand-error transition-colors text-sm font-semibold"
          >
            <AlertTriangle size={18} /> Salir
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-black shrink-0">
        <div
          className="h-full bg-brand-accent transition-all duration-300 ease-out shadow-[0_0_12px_rgba(242,196,0,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col max-w-4xl mx-auto w-full">
        <div className="bg-[#16191e] border border-brand-border rounded-2xl p-8 md:p-12 shadow-2xl flex-1 flex flex-col justify-center animate-slide-up">
          {/* Badge de Modalidad de Pregunta */}
          <div className="mb-6 flex items-center gap-2">
            {qType === 'true_false' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <CheckSquare2 size={14} /> Modalidad: Falso o Verdadero
              </span>
            ) : qType === 'fill_in_the_blank' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Edit3 size={14} /> Modalidad: Completa la Frase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <ListOrdered size={14} /> Modalidad: Selección Múltiple
              </span>
            )}
          </div>

          {/* Enunciado según modalidad */}
          {qType === 'fill_in_the_blank' ? (
            renderFillInTheBlankText(currentQuestion.question_text, selectedOption?.option_text)
          ) : (
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 leading-snug">
              <span className="text-brand-accent mr-3">{currentQuestionIdx + 1}.</span>
              {currentQuestion.question_text}
            </h2>
          )}

          {/* Imagen Radiológica Opcional */}
          {currentQuestion.image_url && (
            <div className="my-6 rounded-xl overflow-hidden border border-brand-border max-h-64 flex items-center justify-center bg-black/40">
              <img
                src={currentQuestion.image_url}
                alt={currentQuestion.image_alt || 'Imagen de la pregunta'}
                className="max-h-64 object-contain"
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* RENDERIZADO DE OPCIONES POR MODALIDAD */}
          {/* ============================================================ */}

          {/* Modalidad 1: Falso y Verdadero (Tarjetas Grandes) */}
          {qType === 'true_false' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isVerdadero = option.option_text.toLowerCase().includes('verdadero');

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center ${
                      isSelected
                        ? isVerdadero
                          ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : 'border-red-400 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        : 'border-brand-border bg-[#1a1d21] hover:border-brand-muted hover:bg-[#202429]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-transform ${
                      isSelected 
                        ? (isVerdadero ? 'bg-emerald-500 text-black scale-110' : 'bg-red-500 text-white scale-110')
                        : 'bg-[#111214] text-brand-muted'
                    }`}>
                      {isVerdadero ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.option_text}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : qType === 'fill_in_the_blank' ? (
            /* Modalidad 2: Completa (Pills de Completación) */
            <div className="space-y-4 mt-6">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Selecciona la opción correcta para completar el espacio:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id;
                  const alphaLabel = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'border-brand-border bg-[#1a1d21] hover:border-purple-500/40 hover:bg-[#202429]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-[#111214] text-brand-muted'
                      }`}>
                        {alphaLabel}
                      </div>
                      <span className={`text-base font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {option.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Modalidad 3: Selección Múltiple Tradicional */
            <div className="space-y-4 mt-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                const alphaLabel = String.fromCharCode(65 + index);

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left p-5 md:p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-6 group ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_15px_rgba(242,196,0,0.2)]'
                        : 'border-brand-border bg-[#1a1d21] hover:border-brand-muted hover:bg-[#202429]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors shrink-0 ${
                      isSelected ? 'bg-brand-accent text-brand-dark' : 'bg-[#111214] text-brand-muted group-hover:text-white'
                    }`}>
                      {alphaLabel}
                    </div>
                    <span className={`text-base md:text-lg transition-colors ${isSelected ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>
                      {option.option_text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer Actions */}
      <footer className="h-24 bg-[#16191e] border-t border-brand-border flex items-center justify-between px-6 md:px-12 shrink-0">
        <button
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-brand-muted hover:text-white hover:bg-brand-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} /> Anterior
        </button>

        {currentQuestionIdx === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-brand-accent text-brand-dark px-8 py-3.5 rounded-xl font-bold hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(242,196,0,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? 'Calificando...' : 'Finalizar Examen'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
            className="flex items-center gap-2 bg-brand-accent text-brand-dark px-8 py-3.5 rounded-xl font-bold hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(242,196,0,0.4)]"
          >
            Siguiente <ArrowRight size={20} />
          </button>
        )}
      </footer>
    </div>
  );
}

