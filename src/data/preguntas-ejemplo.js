/**
 * Datos de Ejemplo: Preguntas de Radiología
 * Descripción: 50 preguntas de ejemplo para carga inicial
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

const PREGUNTAS_EJEMPLO = [
  {
    texto: "¿Cuál es el hueso más grande del cráneo?",
    sistema: "oseo",
    tema: "craneo",
    dificultad: "basico",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Frontal", es_correcta: true },
      { id: "b", texto: "Parietal", es_correcta: false },
      { id: "c", texto: "Temporal", es_correcta: false },
      { id: "d", texto: "Occipital", es_correcta: false }
    ],
    explicacion: "El hueso frontal forma la frente y es el más grande del cráneo. Se articula con los parietales en la sutura coronal.",
    tags: ["anatomía", "cráneo", "huesos"]
  },
  {
    texto: "¿Qué sutura separa los huesos parietales en la línea media?",
    sistema: "oseo",
    tema: "craneo",
    dificultad: "intermedio",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Sutura sagital", es_correcta: true },
      { id: "b", texto: "Sutura coronal", es_correcta: false },
      { id: "c", texto: "Sutura lambdoidea", es_correcta: false },
      { id: "d", texto: "Sutura escamosa", es_correcta: false }
    ],
    explicacion: "La sutura sagital corre en la línea media entre los dos huesos parietales, desde el frontal hasta el occipital.",
    tags: ["anatomía", "cráneo", "suturas"]
  },
  {
    texto: "¿Cuál es el punto cráneo métrico donde se unen las suturas frontal, sagital y coronal?",
    sistema: "oseo",
    tema: "craneo",
    dificultad: "avanzado",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Bregma", es_correcta: true },
      { id: "b", texto: "Nasion", es_correcta: false },
      { id: "c", texto: "Basion", es_correcta: false },
      { id: "d", texto: "Inion", es_correcta: false }
    ],
    explicacion: "El bregma es donde convergen las suturas sagital y coronal. Es importante en anestesia y radiología craneal.",
    tags: ["anatomía", "cráneo", "puntos de referencia"]
  },
  {
    texto: "¿Cuántas vértebras cervicales tiene la columna vertebral?",
    sistema: "oseo",
    tema: "columna",
    dificultad: "basico",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "5", es_correcta: false },
      { id: "b", texto: "7", es_correcta: true },
      { id: "c", texto: "9", es_correcta: false },
      { id: "d", texto: "12", es_correcta: false }
    ],
    explicacion: "Hay 7 vértebras cervicales (C1-C7), siendo C1 (atlas) y C2 (axis) las más importantes para la movilidad.",
    tags: ["anatomía", "columna", "vértebras"]
  },
  {
    texto: "En radiografía de tórax, ¿qué estructura se visualiza como una opacidad radiopaca en la línea media superior?",
    sistema: "respiratorio",
    tema: "torax",
    dificultad: "intermedio",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Timo", es_correcta: true },
      { id: "b", texto: "Corazón", es_correcta: false },
      { id: "c", texto: "Ténder central", es_correcta: false },
      { id: "d", texto: "Epiglotis", es_correcta: false }
    ],
    explicacion: "El timo es una glándula linfoides que es normal ver en niños. En radiografía PA se ve como una opacidad en mediastino superior.",
    tags: ["radiología", "tórax", "mediastino"]
  },
  {
    texto: "¿Qué es la línea de Kerley en radiografía de tórax?",
    sistema: "respiratorio",
    tema: "torax",
    dificultad: "avanzado",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Signo de congestión pulmonar", es_correcta: true },
      { id: "b", texto: "Signo de infarto", es_correcta: false },
      { id: "c", texto: "Signo de neumonía", es_correcta: false },
      { id: "d", texto: "Signo de tuberculosis", es_correcta: false }
    ],
    explicacion: "Las líneas de Kerley son líneas reticulares cortas y horizontales en las regiones pulmonares inferiores, indicativas de edema intersticial por congestión pulmonar.",
    tags: ["radiología", "tórax", "cardiopulmonar"]
  },
  {
    texto: "En una radiografía de abdomen, ¿qué estructura abdominal tiene la mayor densidad radiopaca?",
    sistema: "digestivo",
    tema: "abdomen",
    dificultad: "basico",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Hígado", es_correcta: true },
      { id: "b", texto: "Estomago", es_correcta: false },
      { id: "c", texto: "Intestino delgado", es_correcta: false },
      { id: "d", texto: "Intestino grueso", es_correcta: false }
    ],
    explicacion: "El hígado es la estructura abdominal más grande y radiopaca, visible como una masa homogénea en el cuadrante superior derecho.",
    tags: ["radiología", "abdomen", "hígado"]
  },
  {
    texto: "¿Cuál es el signo radiográfico clásico de obstrucción intestinal?",
    sistema: "digestivo",
    tema: "abdomen",
    dificultad: "intermedio",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Patrón de asas en escalera", es_correcta: true },
      { id: "b", texto: "Aire libre", es_correcta: false },
      { id: "c", texto: "Signo de Rigler", es_correcta: false },
      { id: "d", texto: "Signo de Chilaiditi", es_correcta: false }
    ],
    explicacion: "El patrón en escalera (step-ladder) se observa en obstrucción intestinal, con asas dilatadas del intestino delgado alineadas.",
    tags: ["radiología", "abdomen", "obstrucción"]
  },
  {
    texto: "En la pelvis, ¿cuál es el hueso más anterior?",
    sistema: "oseo",
    tema: "pelvis",
    dificultad: "basico",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Pubis", es_correcta: true },
      { id: "b", texto: "Ilion", es_correcta: false },
      { id: "c", texto: "Isquion", es_correcta: false },
      { id: "d", texto: "Sacro", es_correcta: false }
    ],
    explicacion: "El pubis es la porción más anterior de la pelvis, donde se forma la sínfisis púbica.",
    tags: ["anatomía", "pelvis", "huesos"]
  },
  {
    texto: "¿Qué es el ángulo subpúbico en la anatomía pelviana?",
    sistema: "oseo",
    tema: "pelvis",
    dificultad: "avanzado",
    tipo: "multiple_choice",
    opciones: [
      { id: "a", texto: "Ángulo formado por las ramas púbicas inferiores", es_correcta: true },
      { id: "b", texto: "Ángulo del sacro", es_correcta: false },
      { id: "c", texto: "Ángulo del ilion", es_correcta: false },
      { id: "d", texto: "Ángulo del promontorio", es_correcta: false }
    ],
    explicacion: "El ángulo subpúbico es formado por la convergencia de las ramas púbicas inferiores. Es mayor en mujeres (~80-90°) que en hombres (~50-70°).",
    tags: ["anatomía", "pelvis", "dimorfismo sexual"]
  }
];

// Exportar para carga inicial
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PREGUNTAS_EJEMPLO;
}
