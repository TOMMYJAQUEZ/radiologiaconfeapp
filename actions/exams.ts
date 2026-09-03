'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { shuffleArray, calculateScore, generateCertificateNumber } from '@/lib/utils'
import type { QuestionForExam, AttemptAnswer } from '@/types'

// ============================================================
// INICIAR UN EXAMEN
// Selecciona preguntas aleatoriamente server-side
// ============================================================
export async function startExam(examId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Verificar que el examen existe y está publicado
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('*, category:categories(name)')
    .eq('id', examId)
    .eq('is_published', true)
    .single()

  if (examError || !exam) return { error: 'El examen no está disponible.' }

  // Verificar si tiene un intento en progreso
  const { data: existingAttempt } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (existingAttempt) {
    return { attemptId: existingAttempt.id, isExisting: true }
  }

  // Obtener preguntas activas de la categoría del examen
  const { data: allQuestions, error: qError } = await supabase
    .from('questions')
    .select('id')
    .eq('category_id', exam.category_id)
    .eq('is_active', true)

  if (qError || !allQuestions || allQuestions.length < exam.question_count) {
    return { error: 'No hay suficientes preguntas disponibles para este examen.' }
  }

  // Seleccionar preguntas aleatoriamente (server-side)
  const selectedQuestions = shuffleArray(allQuestions).slice(0, exam.question_count)

  // Crear el intento
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .insert({
      exam_id: examId,
      student_id: user.id,
      total_questions: exam.question_count,
      status: 'in_progress',
    })
    .select('id')
    .single()

  if (attemptError || !attempt) return { error: 'No se pudo iniciar el examen.' }

  // Guardar orden de preguntas en attempt_answers (pre-registrar slots)
  // Esto fija el orden y garantiza inmutabilidad histórica
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, question_text, question_type, image_url, image_alt, image_caption,
      options:question_options(id, option_text, order_index, is_correct)
    `)
    .in('id', selectedQuestions.map((q) => q.id))

  if (!questions) return { error: 'Error cargando preguntas.' }

  // Para cada pregunta, insertar un slot de respuesta
  const answerSlots = selectedQuestions.map((sq, idx) => {
    const q = questions.find((qq) => qq.id === sq.id)!
    const correctOption = (q.options as any[]).find((o: any) => o.is_correct)
    return {
      attempt_id: attempt.id,
      question_id: q.id,
      question_text_snapshot: q.question_text,
      correct_option_id: correctOption.id,
      is_correct: false,
      options_snapshot: (q.options as any[])
        .sort((a, b) => a.order_index - b.order_index)
        .map((o: any) => ({ id: o.id, text: o.option_text, order_index: o.order_index })),
      order_index: idx,
    }
  })

  await supabase.from('attempt_answers').insert(answerSlots)

  return { attemptId: attempt.id, isExisting: false }
}

// ============================================================
// OBTENER DATOS DEL INTENTO ACTIVO (SIN RESPUESTAS CORRECTAS)
// ============================================================
export async function getActiveAttempt(attemptId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select(`
      id, status, started_at,
      exam:exams(id, title, time_limit_minutes, passing_score, category:categories(name))
    `)
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()

  if (!attempt || attempt.status !== 'in_progress') return null

  // Obtener las preguntas del intento (el snapshot guardado)
  const { data: answers } = await supabase
    .from('attempt_answers')
    .select('question_id, question_text_snapshot, options_snapshot, selected_option_id, order_index')
    .eq('attempt_id', attemptId)
    .order('order_index')

  if (!answers) return null

  // Obtener imágenes de las preguntas
  const questionIds = answers.map((a) => a.question_id)
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_type, image_url, image_alt, image_caption')
    .in('id', questionIds)

  const questionsMap = new Map(questions?.map((q) => [q.id, q]) ?? [])

  const questionsForExam: QuestionForExam[] = answers.map((a) => {
    const q = questionsMap.get(a.question_id)
    return {
      id: a.question_id,
      question_text: a.question_text_snapshot,
      question_type: q?.question_type ?? 'multiple_choice',
      image_url: q?.image_url ?? null,
      image_alt: q?.image_alt ?? null,
      image_caption: q?.image_caption ?? null,
      options: (a.options_snapshot as any[]).map((o: any) => ({
        id: o.id,
        option_text: o.text,
        order_index: o.order_index,
      })),
    }
  })

  const savedAnswers: Record<string, string> = {}
  answers.forEach((a) => {
    if (a.selected_option_id) {
      savedAnswers[a.question_id] = a.selected_option_id
    }
  })

  const examData = attempt.exam as any

  return {
    attemptId,
    examId: examData.id,
    examTitle: examData.title,
    categoryName: examData.category?.name ?? '',
    timeLimitMinutes: examData.time_limit_minutes,
    startedAt: attempt.started_at,
    questions: questionsForExam,
    savedAnswers,
  }
}

// ============================================================
// GUARDAR RESPUESTA PARCIAL
// ============================================================
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Verificar que el intento pertenece al usuario
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('id, status')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()

  if (!attempt || attempt.status !== 'in_progress') {
    return { error: 'El intento no es válido.' }
  }

  await supabase
    .from('attempt_answers')
    .update({ selected_option_id: selectedOptionId })
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)

  return { success: true }
}

// ============================================================
// ENVIAR EXAMEN Y CALIFICAR
// ============================================================
export async function submitExam(attemptId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  // Obtener el intento
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*, exam:exams(passing_score, question_count)')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()

  if (!attempt || attempt.status !== 'in_progress') {
    return { error: 'El intento no es válido.' }
  }

  // Obtener todas las respuestas
  const { data: answers } = await supabase
    .from('attempt_answers')
    .select('question_id, selected_option_id, correct_option_id')
    .eq('attempt_id', attemptId)

  if (!answers) return { error: 'No se encontraron respuestas.' }

  // Calificar server-side
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0

  const updates = answers.map((a) => {
    let isCorrect = false
    if (!a.selected_option_id) {
      unansweredCount++
    } else if (a.selected_option_id === a.correct_option_id) {
      isCorrect = true
      correctCount++
    } else {
      incorrectCount++
    }
    return {
      attempt_id: attemptId,
      question_id: a.question_id,
      is_correct: isCorrect,
    }
  })

  // Actualizar is_correct en cada respuesta
  for (const upd of updates) {
    await supabase
      .from('attempt_answers')
      .update({ is_correct: upd.is_correct })
      .eq('attempt_id', attemptId)
      .eq('question_id', upd.question_id)
  }

  const totalQuestions = answers.length
  const scorePercentage = calculateScore(correctCount, totalQuestions)
  const examData = attempt.exam as any
  const isPassed = scorePercentage >= (examData?.passing_score ?? 70)

  // Calcular tiempo usado
  const startedAt = new Date(attempt.started_at)
  const submittedAt = new Date()
  const timeUsedSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000)

  // Actualizar el intento con los resultados
  await supabase
    .from('exam_attempts')
    .update({
      status: 'submitted',
      submitted_at: submittedAt.toISOString(),
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      unanswered: unansweredCount,
      score_percentage: scorePercentage,
      is_passed: isPassed,
      time_used_seconds: timeUsedSeconds,
    })
    .eq('id', attemptId)

  // Generar certificado si aprobó
  if (isPassed) {
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id')
      .eq('attempt_id', attemptId)
      .maybeSingle()

    if (!existingCert) {
      await supabase.from('certificates').insert({
        student_id: user.id,
        exam_id: attempt.exam_id,
        attempt_id: attemptId,
        certificate_number: generateCertificateNumber(),
        is_valid: true,
      })
    }
  }

  // Auditoría
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'EXAM_SUBMITTED',
    entity_type: 'exam_attempt',
    entity_id: attemptId,
    details: { score: scorePercentage, is_passed: isPassed },
  })

  revalidatePath('/dashboard/results')
  revalidatePath('/dashboard')
  return { success: true, scorePercentage, isPassed }
}

// ============================================================
// OBTENER RESULTADO DE UN INTENTO (para pantalla de resultados)
// ============================================================
export async function getAttemptResult(attemptId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exam:exams(*, category:categories(name))
    `)
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single()

  if (!attempt) return null

  const { data: answers } = await supabase
    .from('attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('order_index')

  return { attempt, answers: answers ?? [] }
}
