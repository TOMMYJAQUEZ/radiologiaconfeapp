'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/actions/auth'
import type { UserRole } from '@/types'

// ============================================================
// VERIFICAR PRIVILEGIOS DE ADMINISTRADOR / DIRECTOR
// ============================================================
async function ensureAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Acceso no autorizado. Se requieren permisos de Director/Administrador.')
  }
  return user
}

// ============================================================
// OBTENER TODOS LOS USUARIOS CON MÉTRICAS
// ============================================================
export async function getAllUsers(search?: string, roleFilter?: string) {
  await ensureAdmin()
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      *,
      attempts:exam_attempts(count),
      certificates:certificates(count)
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,institution.ilike.%${search}%`)
  }

  if (roleFilter && ['STUDENT', 'TEACHER', 'ADMIN'].includes(roleFilter)) {
    query = query.eq('role', roleFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return (data || []).map((u: any) => ({
    ...u,
    attemptsCount: u.attempts?.[0]?.count ?? 0,
    certificatesCount: u.certificates?.[0]?.count ?? 0,
  }))
}

// ============================================================
// CAMBIAR ROL DE USUARIO (STUDENT / TEACHER / ADMIN)
// ============================================================
export async function updateUserRole(userId: string, newRole: UserRole) {
  const currentAdmin = await ensureAdmin()
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. Actualizar en profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (profileError) {
    return { error: 'No se pudo actualizar el rol del usuario en la base de datos.' }
  }

  // 2. Actualizar en Supabase Auth metadata
  try {
    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    })
  } catch (err) {
    console.warn('Could not update auth user_metadata directly:', err)
  }

  // 3. Registrar auditoría
  await supabase.from('audit_logs').insert({
    user_id: currentAdmin.id,
    action: `USER_ROLE_CHANGED_TO_${newRole}`,
    entity_type: 'profile',
    entity_id: userId,
    details: { newRole, changedBy: currentAdmin.full_name },
  })

  revalidatePath('/dashboard/users')
  return { success: true }
}

// ============================================================
// ACTIVAR / DESACTIVAR USUARIO
// ============================================================
export async function toggleUserActive(userId: string, isActive: boolean) {
  const currentAdmin = await ensureAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: 'No se pudo actualizar el estado de la cuenta.' }
  }

  await supabase.from('audit_logs').insert({
    user_id: currentAdmin.id,
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    entity_type: 'profile',
    entity_id: userId,
    details: { isActive, changedBy: currentAdmin.full_name },
  })

  revalidatePath('/dashboard/users')
  return { success: true }
}

// ============================================================
// APROBAR SOLICITUD DE MAESTRO
// ============================================================
export async function approveTeacherRequest(userId: string) {
  return updateUserRole(userId, 'TEACHER')
}

// ============================================================
// RECHAZAR → BAJAR A ESTUDIANTE
// ============================================================
export async function rejectTeacherRequest(userId: string) {
  return updateUserRole(userId, 'STUDENT')
}

// ============================================================
// ELIMINAR USUARIO COMPLETAMENTE
// ============================================================
export async function deleteUser(userId: string) {
  const currentAdmin = await ensureAdmin()
  const adminSupabase = createAdminClient()
  const supabase = await createClient()

  // Registrar auditoría antes de borrar
  await supabase.from('audit_logs').insert({
    user_id: currentAdmin.id,
    action: 'USER_DELETED',
    entity_type: 'profile',
    entity_id: userId,
    details: { deletedBy: currentAdmin.full_name },
  })

  // Eliminar de Supabase Auth (cascade borra el perfil por ON DELETE CASCADE)
  const { error } = await adminSupabase.auth.admin.deleteUser(userId)

  if (error) {
    return { error: 'No se pudo eliminar el usuario. Verifica que no tenga datos críticos pendientes.' }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
