import type { GradeLabel } from '@/types'

/**
 * Calcula la etiqueta de calificación según el porcentaje.
 * Escala: 90-100 Excelente, 80-89 Muy bueno, 70-79 Aprobado, 0-69 Necesita reforzamiento
 */
export function getGradeLabel(percentage: number): GradeLabel {
  if (percentage >= 90) return 'Excelente'
  if (percentage >= 80) return 'Muy bueno'
  if (percentage >= 70) return 'Aprobado'
  return 'Necesita reforzamiento'
}

/**
 * Color Tailwind para la calificación
 */
export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-400'
  if (percentage >= 80) return 'text-blue-400'
  if (percentage >= 70) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Determina si el estudiante aprobó según el porcentaje mínimo del examen
 */
export function isPassed(percentage: number, passingScore: number): boolean {
  return percentage >= passingScore
}

/**
 * Calcula el porcentaje de calificación
 */
export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Genera un número de certificado único
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCF-${year}-${random}`
}

/**
 * Formatea segundos en formato mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Formatea minutos como "X min" o "1h Xmin"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/**
 * Formatea fecha en español
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea fecha y hora en español
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Ordena un array aleatoriamente (Fisher-Yates shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Trunca texto con elipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Genera slug desde texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Etiqueta de dificultad en español
 */
export function difficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    basic: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  }
  return map[difficulty] ?? difficulty
}

/**
 * Etiqueta del tipo de pregunta en español
 */
export function questionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    multiple_choice: 'Opción múltiple',
    true_false: 'Verdadero/Falso',
  }
  return map[type] ?? type
}

/**
 * Clases CSS condicionales (cn utility)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
