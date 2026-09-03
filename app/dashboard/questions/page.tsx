import { getQuestions } from '@/actions/teacher'
import { getCategories } from '@/actions/categories'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import QuestionsView from '@/components/dashboard/QuestionsView'

export const metadata = {
  title: 'Banco de Preguntas | Radiología con Fe',
  description: 'Gestión completa del banco de preguntas médicas para maestros y directores.',
}

export default async function QuestionsPage() {
  const user = await getCurrentUser()
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const [{ questions }, categories] = await Promise.all([
    getQuestions({ pageSize: 100 }),
    getCategories(),
  ])

  return <QuestionsView initialQuestions={questions as any} categories={categories} />
}
