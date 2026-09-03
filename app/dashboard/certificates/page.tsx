import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCertificateRequests, getCertificates, getDirectorConfig } from '@/actions/certificates'
import CertificatesDashboardClient from './CertificatesDashboardClient'

export const metadata = {
  title: 'Gestión de Certificados | Radiología con Fe',
  description: 'Panel de control para gestión, aprobación y expedición de certificados académicos.',
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (!profile || !['ADMIN', 'TEACHER'].includes(profile.role)) redirect('/dashboard')

  const [{ requests }, { certificates }, { config }] = await Promise.all([
    getCertificateRequests(),
    getCertificates(),
    getDirectorConfig(),
  ])

  return (
    <CertificatesDashboardClient
      requests={requests ?? []}
      certificates={certificates ?? []}
      config={config}
      userRole={profile.role}
      userName={profile.full_name ?? ''}
    />
  )
}
