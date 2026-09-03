'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ============================================================
// REGISTRO DE ESTUDIANTE
// ============================================================
export async function registerStudent(prevStateOrFormData: any, formData?: FormData) {
  const actualFormData = formData || (prevStateOrFormData instanceof FormData ? prevStateOrFormData : null);
  if (!actualFormData) {
    return { error: 'Datos de formulario inválidos.' };
  }

  const supabase = await createClient()

  const fullName = actualFormData.get('full_name') as string
  const email = actualFormData.get('email') as string
  const password = actualFormData.get('password') as string
  const institution = actualFormData.get('institution') as string
  const academicLevel = actualFormData.get('academic_level') as string
  const country = actualFormData.get('country') as string
  const phone = actualFormData.get('phone') as string | null

  if (!fullName || !email || !password) {
    return { error: 'Completa todos los campos obligatorios.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const requestedRole = (actualFormData.get('requested_role') as string) || 'STUDENT'
  const isTeacherRequest = requestedRole === 'TEACHER'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: isTeacherRequest ? 'STUDENT' : 'STUDENT', // Los maestros inician como estudiante hasta ser aprobados o se les asigna su solicitud
        requested_role: requestedRole,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este correo ya está registrado.' }
    }
    return { error: 'No se pudo crear la cuenta. Intenta nuevamente.' }
  }

  // Actualizar perfil con datos adicionales
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        institution: institution || null,
        academic_level: academicLevel || null,
        country: country || null,
        phone: phone || null,
      })
      .eq('id', data.user.id)
  }

  return { success: true, message: isTeacherRequest ? 'Cuenta creada. Tu solicitud de acceso docente será revisada por la Dirección.' : undefined }
}

// ============================================================
// LOGIN
// ============================================================
export async function login(prevStateOrFormData: any, formData?: FormData) {
  const actualFormData = formData || (prevStateOrFormData instanceof FormData ? prevStateOrFormData : null);
  if (!actualFormData) {
    return { error: 'Datos de formulario inválidos.' };
  }

  const email = (actualFormData.get('email') as string)?.trim()
  const password = (actualFormData.get('password') as string)?.trim()

  if (!email || !password) {
    return { error: 'Ingresa tu correo y contraseña.' }
  }

  // Usar el cliente SSR normal — funciona correctamente en Server Actions
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[LOGIN ERROR]', { message: error.message, status: error.status, email })
    return { error: 'Correo o contraseña incorrectos.' }
  }

  // Sesión iniciada correctamente — la página hará el redirect
  return { success: true }
}

// ============================================================
// LOGOUT
// ============================================================
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

import { cookies } from 'next/headers'

// ============================================================
// OBTENER USUARIO ACTUAL CON PERFIL Y SIMULACIÓN DE ROL
// ============================================================
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Si el usuario es ADMIN (Director), revisamos si tiene una cookie de simulación activa
  if (profile.role === 'ADMIN') {
    const cookieStore = await cookies()
    const simulatedRole = cookieStore.get('rcf_simulated_role')?.value
    if (simulatedRole && ['ADMIN', 'TEACHER', 'STUDENT'].includes(simulatedRole)) {
      return {
        ...profile,
        actual_role: 'ADMIN',
        role: simulatedRole,
        is_simulating: simulatedRole !== 'ADMIN',
      }
    }
  }

  return {
    ...profile,
    actual_role: profile.role,
    is_simulating: false,
  }
}

// ============================================================
// CAMBIO DE VISTA DE ROL (SIMULACIÓN PARA EL DIRECTOR)
// ============================================================
export async function switchRole(newRole: 'ADMIN' | 'TEACHER' | 'STUDENT') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { error: 'Solo el Director General puede cambiar de perspectiva de rol.' }
  }

  const cookieStore = await cookies()
  if (newRole === 'ADMIN') {
    cookieStore.delete('rcf_simulated_role')
  } else {
    cookieStore.set('rcf_simulated_role', newRole, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard', 'layout')
  return { success: true, role: newRole }
}

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================
export async function updateProfile(prevStateOrFormData: any, formData?: FormData) {
  const actualFormData = formData || (prevStateOrFormData instanceof FormData ? prevStateOrFormData : null);
  if (!actualFormData) {
    return { error: 'Datos de formulario inválidos.' };
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado.' }

  const avatarUrl = actualFormData.get('avatar_url') as string | null

  const updateData: Record<string, any> = {
    full_name: actualFormData.get('full_name') as string,
    institution: actualFormData.get('institution') as string,
    academic_level: actualFormData.get('academic_level') as string,
    country: actualFormData.get('country') as string,
    phone: actualFormData.get('phone') as string,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl !== undefined && avatarUrl !== null) {
    updateData.avatar_url = avatarUrl || null
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) return { error: 'No se pudo actualizar el perfil.' }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'PROFILE_UPDATED',
    entity_type: 'profile',
    entity_id: user.id,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

// ============================================================
// ACTUALIZAR FOTO DE PERFIL DIRECTAMENTE
// ============================================================
export async function updateAvatar(avatarUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'No se pudo actualizar la foto de perfil.' }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

