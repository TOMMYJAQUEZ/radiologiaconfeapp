/**
 * Datos de Ejemplo: Definiciones de Logros
 * Descripción: Sistema de 50+ logros para gamificación
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

const LOGROS_DEFINICION = [
  {
    id: "primer_paso",
    nombre: "Primer Paso",
    descripcion: "Completar tu primer quiz",
    icono: "🎯",
    categoria: "iniciador",
    xpReward: 10,
    condicion: "completar_quiz_1"
  },
  {
    id: "racha_3_dias",
    nombre: "Racha de 3 Días",
    descripcion: "Mantener racha por 3 días consecutivos",
    icono: "🔥",
    categoria: "consistencia",
    xpReward: 25,
    condicion: "racha_dias_3"
  },
  {
    id: "racha_7_dias",
    nombre: "Semana Dorada",
    descripcion: "Mantener racha por 7 días consecutivos",
    icono: "🔥🔥",
    categoria: "consistencia",
    xpReward: 100,
    condicion: "racha_dias_7"
  },
  {
    id: "racha_30_dias",
    nombre: "30 Días de Gloria",
    descripcion: "Mantener racha por 30 días consecutivos",
    icono: "🔥🔥🔥",
    categoria: "consistencia",
    xpReward: 300,
    condicion: "racha_dias_30"
  },
  {
    id: "nivel_5",
    nombre: "Novato",
    descripcion: "Alcanzar nivel 5",
    icono: "⭐",
    categoria: "experto",
    xpReward: 50,
    condicion: "nivel_5"
  },
  {
    id: "nivel_10",
    nombre: "Aprendiz",
    descripcion: "Alcanzar nivel 10",
    icono: "⭐⭐",
    categoria: "experto",
    xpReward: 100,
    condicion: "nivel_10"
  },
  {
    id: "nivel_25",
    nombre: "Experto",
    descripcion: "Alcanzar nivel 25",
    icono: "⭐⭐⭐",
    categoria: "experto",
    xpReward: 250,
    condicion: "nivel_25"
  },
  {
    id: "maestro_craneo",
    nombre: "Maestro del Cráneo",
    descripcion: "Lograr 95%+ en 10 quizzes de cráneo",
    icono: "🧠",
    categoria: "especialista",
    xpReward: 50,
    condicion: "maestria_craneo"
  },
  {
    id: "maestro_torax",
    nombre: "Pulmones Nítidos",
    descripcion: "Obtener 100% en un quiz de tórax",
    icono: "🫁",
    categoria: "especialista",
    xpReward: 75,
    condicion: "perfeccion_torax"
  },
  {
    id: "maestro_abdomen",
    nombre: "Maestro del Abdomen",
    descripcion: "Completar 20 quizzes de abdomen",
    icono: "🫀",
    categoria: "especialista",
    xpReward: 60,
    condicion: "quizzes_abdomen_20"
  },
  {
    id: "avanzado",
    nombre: "Challenger",
    descripcion: "Completar 10 quizzes en dificultad Avanzado",
    icono: "💪",
    categoria: "challenger",
    xpReward: 100,
    condicion: "quizzes_avanzado_10"
  },
  {
    id: "speedrun",
    nombre: "Rápido",
    descripcion: "Completar quiz en menos de 5 minutos",
    icono: "⚡",
    categoria: "challenger",
    xpReward: 30,
    condicion: "quiz_menos_5_min"
  },
  {
    id: "perfeccion",
    nombre: "Perfección",
    descripcion: "Obtener 100% en un examen",
    icono: "💯",
    categoria: "challenger",
    xpReward: 150,
    condicion: "examen_100_porciento"
  },
  {
    id: "top_10",
    nombre: "Top 10",
    descripcion: "Entrar al top 10 del leaderboard",
    icono: "🏆",
    categoria: "social",
    xpReward: 80,
    condicion: "leaderboard_top_10"
  },
  {
    id: "numero_1",
    nombre: "Campeón",
    descripcion: "Ser el número 1 en el leaderboard",
    icono: "👑",
    categoria: "social",
    xpReward: 200,
    condicion: "leaderboard_numero_1"
  },
  {
    id: "maquina_estudio",
    nombre: "Máquina de Estudio",
    descripcion: "Completar 100 quizzes",
    icono: "🤖",
    categoria: "consistencia",
    xpReward: 150,
    condicion: "quizzes_100"
  },
  {
    id: "todos_los_temas",
    nombre: "Enciclopedia Médica",
    descripcion: "Completar quiz en todos los temas disponibles",
    icono: "📚",
    categoria: "experto",
    xpReward: 200,
    condicion: "todos_temas_completados"
  }
];

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOGROS_DEFINICION;
}
