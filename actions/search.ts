'use server'

import { createClient } from '@/lib/supabase/server'
import { ANATOMY_STUDIES } from '@/lib/anatomyData'

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  type: 'anatomy' | 'lesson' | 'exam' | 'assignment' | 'category' | 'page'
  url: string
  badge?: string
}

export async function globalSearch(rawQuery: string): Promise<{ results: SearchResultItem[] }> {
  const query = rawQuery.trim().toLowerCase()
  if (!query || query.length < 2) return { results: [] }

  const results: SearchResultItem[] = []

  // 1. Laboratorio de Anatomía (Local data de alta fidelidad)
  for (const study of ANATOMY_STUDIES) {
    const studyMatches =
      study.title.toLowerCase().includes(query) ||
      study.modality.toLowerCase().includes(query) ||
      study.description.toLowerCase().includes(query)

    if (studyMatches) {
      results.push({
        id: `anatomy-${study.id}`,
        title: study.title,
        subtitle: `${study.modality} · ${study.projection}`,
        type: 'anatomy',
        url: `/dashboard/anatomy-lab?study=${study.id}`,
        badge: 'Laboratorio',
      })
    }

    // Buscar en estructuras anatómicas internas
    for (const struct of study.structures) {
      if (
        struct.name.toLowerCase().includes(query) ||
        struct.description.toLowerCase().includes(query) ||
        struct.clinicalSignificance?.toLowerCase().includes(query)
      ) {
        // Evitar duplicar el mismo estudio si ya está
        if (!results.some(r => r.id === `anatomy-${study.id}-${struct.id}`)) {
          results.push({
            id: `anatomy-${study.id}-${struct.id}`,
            title: struct.name,
            subtitle: `Estructura en ${study.title} (${study.modality})`,
            type: 'anatomy',
            url: `/dashboard/anatomy-lab?study=${study.id}&struct=${struct.id}`,
            badge: 'Anatomía',
          })
        }
      }
    }
  }

  // 2. Base de Datos: Clases / Lecciones
  try {
    const supabase = await createClient()

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, description, category')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(6)

    if (lessons) {
      for (const l of lessons) {
        results.push({
          id: `lesson-${l.id}`,
          title: l.title,
          subtitle: l.description || 'Clase pre-grabada de radiología',
          type: 'lesson',
          url: `/dashboard/student/lessons?lessonId=${l.id}`,
          badge: l.category || 'Clase',
        })
      }
    }

    // 3. Exámenes
    const { data: exams } = await supabase
      .from('exams')
      .select('id, title, description, difficulty')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(6)

    if (exams) {
      for (const e of exams) {
        results.push({
          id: `exam-${e.id}`,
          title: e.title,
          subtitle: e.description || 'Evaluación de conocimientos',
          type: 'exam',
          url: `/dashboard/student/exams`,
          badge: e.difficulty ? `Examen (${e.difficulty})` : 'Examen',
        })
      }
    }

    // 4. Tareas / Asignaciones
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, description')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(6)

    if (assignments) {
      for (const a of assignments) {
        results.push({
          id: `assignment-${a.id}`,
          title: a.title,
          subtitle: a.description || 'Tarea académica',
          type: 'assignment',
          url: `/dashboard/student/assignments`,
          badge: 'Tarea',
        })
      }
    }

    // 5. Categorías / Módulos
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, description')
      .ilike('name', `%${query}%`)
      .limit(4)

    if (categories) {
      for (const c of categories) {
        results.push({
          id: `cat-${c.id}`,
          title: c.name,
          subtitle: c.description || 'Módulo temático',
          type: 'category',
          url: `/dashboard/categories`,
          badge: 'Módulo',
        })
      }
    }
  } catch (err) {
    console.error('Error in globalSearch database queries:', err)
  }

  // 6. Páginas fijas clave
  const keyPages = [
    { name: 'Laboratorio de Anatomía', url: '/dashboard/anatomy-lab', desc: 'Explorador interactivo y modo desafío' },
    { name: 'Mis Tareas y Certificación', url: '/dashboard/student/assignments', desc: 'Entrega de trabajos y solicitud de certificado' },
    { name: 'Mis Exámenes', url: '/dashboard/student/exams', desc: 'Evaluaciones y bancos de preguntas' },
    { name: 'Clases Pre-grabadas', url: '/dashboard/student/lessons', desc: 'Videoteca médica' },
    { name: 'Mi Progreso', url: '/dashboard/student/progress', desc: 'Analíticas y gráficos de rendimiento' },
    { name: 'Configuración de Cuenta', url: '/dashboard/settings', desc: 'Foto de perfil y datos personales' },
  ]

  for (const page of keyPages) {
    if (page.name.toLowerCase().includes(query) || page.desc.toLowerCase().includes(query)) {
      results.push({
        id: `page-${page.url}`,
        title: page.name,
        subtitle: page.desc,
        type: 'page',
        url: page.url,
        badge: 'Sección',
      })
    }
  }

  // Retornar máximo 12 resultados ordenados
  return { results: results.slice(0, 12) }
}
