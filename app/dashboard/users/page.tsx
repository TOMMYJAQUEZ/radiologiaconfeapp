import { getAllUsers } from '@/actions/admin'
import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import UsersManagement from '@/components/dashboard/UsersManagement'

export const metadata = {
  title: 'Control de Usuarios | Radiología con Fe',
  description: 'Panel de gestión y aprobación de usuarios del Director Francisco Jáquez.',
}

export default async function UsersPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await getAllUsers()

  return <UsersManagement initialUsers={users} currentAdminName={user.full_name} />
}
