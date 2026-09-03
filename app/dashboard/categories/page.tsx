import { getCategories } from '@/actions/categories'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import CategoriesView from '@/components/dashboard/CategoriesView'

export const metadata = {
  title: 'Categorías y Materias | Radiología con Fe',
  description: 'Gestión de materias y ramas de estudio en Radiología con Fe.',
}

export default async function CategoriesPage() {
  const user = await getCurrentUser()
  if (!user || !['TEACHER', 'ADMIN'].includes(user.role)) redirect('/dashboard')

  const categories = await getCategories()

  return <CategoriesView initialCategories={categories as any} />
}
