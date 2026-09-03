import { getCurrentUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import SettingsView from '@/components/dashboard/SettingsView'

export const metadata = {
  title: 'Configuración de Cuenta | Radiología con Fe',
  description: 'Ajustes de perfil y preferencias en Radiología con Fe.',
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return <SettingsView userProfile={user as any} />
}
