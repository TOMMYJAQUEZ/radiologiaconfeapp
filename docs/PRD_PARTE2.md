# PRODUCT REQUIREMENTS DOCUMENT (PRD) - PARTE 2
## Radiología con Fe 🩻✨

**Continuación de especificaciones técnicas y funcionales**

---

## 14. SISTEMA DE ANATOMÍA

### 14.1 Módulo de Anatomía Interactiva

**Objetivo:**
Proveer visualización interactiva de sistemas anatómicos con referencia radiológica, permitiendo al estudiante explorar, aprender y asociar anatomía con imágenes radiológicas reales.

**Estructura Anatómica:**

```javascript
SISTEMAS_ANATOMICOS = [
  {
    id: "oseo",
    nombre: "Sistema Óseo",
    descripcion: "Esqueleto, huesos, articulaciones",
    imagen: "url-oseo",
    estructuras: [
      {
        id: "craneo",
        nombre: "Cráneo",
        descripcion: "Formado por 22 huesos...",
        imagen: "url-craneo-3d",
        radiografia: "url-radiografia-craneo",
        detalles: [
          { nombre: "Frontal", puntos: [[x1,y1], [x2,y2]] },
          { nombre: "Parietal", puntos: [[x1,y1], [x2,y2]] },
          // más huesos
        ]
      },
      { id: "columna", nombre: "Columna Vertebral", ... },
      { id: "torax", nombre: "Tórax", ... },
      { id: "pelvis", nombre: "Pelvis", ... },
      { id: "extremidades", nombre: "Extremidades", ... }
    ]
  },
  {
    id: "muscular",
    nombre: "Sistema Muscular",
    estructuras: [...]
  },
  {
    id: "cardiovascular",
    nombre: "Sistema Cardiovascular",
    estructuras: [...]
  },
  {
    id: "respiratorio",
    nombre: "Sistema Respiratorio",
    estructuras: [...]
  },
  {
    id: "digestivo",
    nombre: "Sistema Digestivo",
    estructuras: [...]
  },
  {
    id: "urogenital",
    nombre: "Sistema Urogenital",
    estructuras: [...]
  },
  {
    id: "neurologico",
    nombre: "Sistema Neurológico",
    estructuras: [...]
  }
]
```

### 14.2 Vista Anatomía - Interfaz

```
┌──────────────────────────────────────────────────────────────────┐
│ ANATÓMICA - SISTEMA ÓSEO                              [< Volver]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Sistema Óseo] [Muscular] [Cardiovascular] [Respiratorio] ..   │
│                                                                  │
├──────────────────┬──────────────────────────────────────────────┤
│ Estructuras:     │                                              │
│ □ Cráneo         │                                              │
│ □ Columna        │                                              │
│ □ Tórax          │      [IMAGEN 3D O RADIOGRAFÍA]               │
│ □ Pelvis         │      [Representación visual]                 │
│ □ Extremidades   │                                              │
│                  │                                              │
│ [COMENZAR QUIZ]  │                                              │
│                  │                                              │
└──────────────────┴���─────────────────────────────────────────────┘
```

**Interactividad:**
- Click en estructura: Resalta en imagen y muestra detalles
- Hover: Tooltip con nombre
- Swipe/Scroll: Navega entre vistas
- Zoom: Pinch to zoom (mobile)
- Rotación: Drag para rotar (3D, si aplica)

### 14.3 Detalles de Estructura Anatómica

**Al seleccionar una estructura:**

```
┌────────────────────────────────────────────────────────────┐
│ CRÁNEO                                        [Cerrar] [X] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ El cráneo está formado por 22 huesos que protegen el      │
│ encéfalo y forman la cara. Se divide en:                  │
│                                                            │
│ • Neurocráneo (8 huesos): Frontal, Parietal, Temporal,    │
│   Occipital, Esfenoides, Etmoides                         │
│                                                            │
│ • Viscerocráneo (14 huesos): Maxilares, Mandíbula, etc.   │
│                                                            │
│ RADIOGRAFÍA DE REFERENCIA:                                │
│ [Imagen radiológica de cráneo con etiquetas]              │
│                                                            │
│ PUNTOS CLAVE:                                              │
│ ✓ Sutura sagital: línea media entre parietales            │
│ ✓ Sutura coronal: entre frontal y parietales              │
│ ✓ Glabela: prominencia frontal central                    │
│                                                            │
│ [CERRAR]  [SIGUIENTE ESTRUCTURA]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 14.4 Base de Datos de Estructuras

**Firestore Collection: `estructuras_anatomicas`**

```javascript
docs/{
  oseo/{
    craneo: {
      nombre: "Cráneo",
      descripcion: "...",
      imagen_3d: "gs://..../craneo.jpg",
      radiografia_ap: "gs://..../craneo-ap.jpg",
      radiografia_lateral: "gs://..../craneo-lateral.jpg",
      componentes: [
        {
          id: "frontal",
          nombre: "Hueso Frontal",
          descripcion: "Hueso que forma la frente...",
          imagen_marcada: "gs://..../frontal-marcado.jpg",
          puntos_referencia: {
            glabela: [x1, y1],
            nasion: [x2, y2]
          }
        },
        // más componentes
      ]
    }
  }
}
```

---

## 15. SISTEMA DE QUIZ

### 15.1 Flujo de Quiz

```
┌─────────────────────┐
│  PANTALLA INICIAL   │
│  "Selecciona Modo"  │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  [ESTUDIO]  [EXAMEN]
      │          │
      ├──────┬───┤
      │      │   │
      ▼      ▼   ▼
   SIN   CON   SIN
  TIEMPO TIEMPO RETROAL.
   NO     30     NO
   FEED   min   FEED
   BACK   FEED  BACK
          BACK
```

### 15.2 Modo Estudio

**Características:**
- Sin límite de tiempo
- Feedback inmediato después cada pregunta
- Mostrar respuesta correcta y explicación
- Opción de ver imagen radiológica
- Sin penalización por errores
- Puede reintentar infinitamente

**Interfaz Pregunta (Modo Estudio):**

```
┌──────────────────────────────────────────────────────────┐
│ MODO ESTUDIO - Cráneo                                    │
│ Pregunta 5 de 20                   ⏱ (sin límite)       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ¿Cuál es el hueso marcado con flecha?                   │
│                                                          │
│ [Imagen radiográfica con flecha señalando estructura]   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Opciones:                                                │
│ ○ A) Frontal          ○ C) Parietal                      │
│ ○ B) Temporal         ○ D) Occipital                     │
│                                                          │
│ [ANTERIOR]  [SIGUIENTE]                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘

// Después de responder:

┌──────────────────────────────────────────────────────────┐
│ ✅ ¡CORRECTO! (Intermedio - 10 XP)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ EXPLICACIÓN:                                             │
│ El hueso frontal forma la prominencia de la frente y     │
│ se articula con los huesos parietales en la sutura       │
│ coronal. En la radiografía, se visualiza como una        │
│ estructura radiopaca en el tercio superior.              │
│                                                          │
│ PUNTOS CLAVE:                                            │
│ • Límite superior: línea de pelo                         │
│ • Articulación: sutura coronal                           │
│ • Senos paranasales: senos frontales                     │
│                                                          │
│ [SIGUIENTE PREGUNTA]                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 15.3 Modo Examen

**Características:**
- Tiempo límite: 30 minutos
- 20 preguntas aleatorias
- Opciones mezcladas (shuffle)
- Sin feedback durante el examen
- Navegación: Puede ir adelante/atrás, pero no regresar a respuestas finalizadas
- Al terminar: Calificación + explicaciones
- Penalización: Respuestas incorrectas no restan XP (pero tampoco suman)

**Interfaz Examen:**

```
┌──────────────────────────────────────────────────────────┐
│ MODO EXAMEN - Radiología General              ⏱ 18:45   │
│ Pregunta 12 de 30 (Progress bar: ▓▓▓▓▓░░░░░░░░░░░)      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ¿Qué hueso está señalado?                               │
│                                                          │
│ [Imagen radiográfica]                                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Opciones (sin feedback):                                 │
│ ○ A) Frontal          ○ C) Parietal                      │
│ ○ B) Temporal         ○ D) Occipital                     │
│                                                          │
│ [ANTERIOR]  [SIGUIENTE]  [TERMINAR EXAMEN]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Pantalla Final Examen:**

```
┌──────────────────────────────────────────────────────────┐
│ ¡EXAMEN COMPLETADO!                                      │
│                                                          │
│             ╔═════════════════╗                         │
│             ║      85%        ║                         │
│             ║   ¡EXCELENTE!   ║                         │
│             ╚═════════════════╝                         │
│                   ⭐⭐⭐⭐⭐                              │
│                                                          │
│ Correctas: 26        Incorrectas: 4                      │
│ XP Obtenido: +150                                        │
│ Racha: +1 día                                            │
│                                                          │
│ RENDIMIENTO POR TEMA:                                    │
│ • Cráneo: 92%        ████████░░                          │
│ • Columna vertebral: 78%  ███████░░░                     │
│ • Tórax: 60%         ██████░░░░░                         │
│ • Pelvis: 101%       ████████░░  (1 bonus)              │
│                                                          │
│ [FINALIZAR]  [VER EXPLICACIONES]                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 15.4 Selección de Temas

**Antes de comenzar un quiz, estudiante selecciona:**

```
┌────────────────────────────────────────────┐
│ SELECCIONA TEMA                            │
├────────────────────────────────────────────┤
│                                            │
│ ✅ CRÁNEO (120 preguntas)                 │
│    Última práctica: Hoy, 14:30             │
│    Mejor puntuación: 92%                   │
│                                            │
│ ✅ COLUMNA VERTEBRAL (95 preguntas)       │
│    Última práctica: Ayer                   │
│    Mejor puntuación: 78%                   │
│                                            │
│ ✅ TÓRAX (110 preguntas)                  │
│    Última práctica: 3 días                 │
│    Mejor puntuación: 85%                   │
│                                            │
│ ✅ PELVIS (85 preguntas)                  │
│ ✅ ABDOMEN (100 preguntas)                │
│ ✅ MIEMBROS (90 preguntas)                │
│                                            │
│ [Continuar con tema]                       │
│                                            │
└────────────────────────────────────────────┘
```

### 15.5 Estructura de Pregunta en Firebase

```javascript
// Firestore: quizzes/preguntas
{
  id: "preg-001-craneo",
  texto: "¿Qué hueso está señalado en la radiografía?",
  sistema: "oseo",  // índice
  tema: "craneo",    // índice
  dificultad: "intermedio",  // básico, intermedio, avanzado
  tipo: "multiple_choice",
  imagen_url: "gs://bucket/images/craneo-001.jpg",
  opciones: [
    { id: "a", texto: "Frontal", es_correcta: true },
    { id: "b", texto: "Temporal", es_correcta: false },
    { id: "c", texto: "Parietal", es_correcta: false },
    { id: "d", texto: "Occipital", es_correcta: false }
  ],
  explicacion: "El hueso frontal forma...",
  tags: ["anatomía", "radiografía", "identificación"],
  createdAt: timestamp,
  updatedAt: timestamp,
  estadisticas: {
    veces_preguntada: 2450,
    veces_correcta: 1960,
    dificultad_real: 0.80  // 80% acierto
  }
}
```

### 15.6 Respuestas del Usuario

```javascript
// Firestore: usuarios/{uid}/quiz_responses
{
  id: "resp-001",
  quiz_id: "quiz-craneo-001",
  pregunta_id: "preg-001-craneo",
  respuesta_usuario: "a",
  es_correcta: true,
  tiempo_respuesta: 15,  // segundos
  modo: "estudio",  // o "examen"
  xp_ganado: 10,
  timestamp: timestamp
}
```

---

## 16. GAMIFICACIÓN

### 16.1 Sistema de XP (Experience Points)

**Adquisición de XP:**

| Acción | XP Base | Multiplicador |
|--------|---------|---------------|
| Respuesta correcta (Básico) | 5 XP | x1 |
| Respuesta correcta (Intermedio) | 10 XP | x1 |
| Respuesta correcta (Avanzado) | 15 XP | x1 |
| Quiz completado (Modo Estudio) | 50 XP | x1 |
| Quiz completado (Modo Examen) | 100 XP | x1 |
| Racha bonus (cada día) | 5 XP | x racha_actual |
| Primer intento en nuevo tema | 25 XP | x1 |
| Logro desbloqueado | Varía | Según logro |

**Ejemplos:**
- Respuesta correcta (Avanzado) + Racha 5 días = 15 × 5 = 75 XP
- Quiz Examen (85%) + Racha 3 = 100 × 1.3 = 130 XP (bonus racha 30%)

### 16.2 Sistema de Niveles

**Progresión:**

```
Nivel 1:  0 XP
Nivel 2:  100 XP
Nivel 3:  250 XP (acumulativo)
Nivel 4:  450 XP
Nivel 5:  700 XP
Nivel 6:  1000 XP
...
Nivel 50: 50,000 XP (máximo v0.1)

Fórmula: XP_requerido = 100 × (n - 1) + 50 × (n - 1)²
```

**Beneficios por Nivel:**
- Nivel 5: Desbloquea "Modo Examen"
- Nivel 10: Badge dorado (visual distinction)
- Nivel 15: Tema especial "Radiología Avanzada"
- Nivel 25: Acceso a reportes de progreso
- Nivel 50: Instructor honorario (futuro)

### 16.3 Sistema de Racha

**Definición:**
Número consecutivo de días en que el usuario completa al menos 1 quiz.

**Reglas:**
- Racha inicia en 1 cuando completa primer quiz del día
- Se incrementa cada día consecutive
- Se reinicia a 0 si pasa 24 horas sin completar quiz
- Muestra contador en dashboard
- Bonus XP: 5 XP × racha_actual por cada respuesta

**Mecánica:**
```javascript
racha_actual = {
  contador: 7,  // días consecutivos
  ultimo_acceso: "2026-07-01T23:45:00Z",
  fecha_inicio: "2026-06-25T08:00:00Z",
  racha_maxima_historica: 15
}
```

**Notificación racha:**
- Al completar día 1: "¡Racha iniciada!"
- Al completar día 5: "🔥 5 días de racha. ¡Vamos!"
- Al completar día 10: "🔥🔥 10 días! Racha épica"
- Si se pierde: "❌ Racha rota. Comienza de nuevo."

### 16.4 Sistema de Logros (Badges)

**Categorías:**

1. **Iniciador**
   - "Primer paso": Completar primer quiz (10 XP)
   - "Racha de 3": Racha de 3 días (25 XP)
   - "Semana dorada": Racha de 7 días (100 XP)

2. **Experto**
   - "Maestro del Cráneo": 95%+ en 10 quizzes de cráneo (50 XP)
   - "Pulmones Nítidos": 100% en módulo respiratorio (75 XP)
   - "Abdomen Master": Completar 20 quizzes de abdomen (60 XP)

3. **Challenger**
   - "Avanzado": Completar 10 quizzes en dificultad Avanzado (100 XP)
   - "Speedrun": Completar quiz en < 5 minutos (30 XP)
   - "Perfección": 100% en examen (150 XP)

4. **Social**
   - "Top 10": Entrar al top 10 del leaderboard (80 XP)
   - "Número 1": Ser el primero en ranking (200 XP)

5. **Consistencia**
   - "30 días": Racha de 30 días (300 XP)
   - "Máquina de estudio": 100 quizzes completados (150 XP)
   - "Radiolog@": Alcanzar nivel 40 (250 XP)

**Visualización Logros:**

```
┌──────────────────────────────────────────────────┐
│ MIS LOGROS (18/50 desbloqueados)                 │
├──────────────────────────────────────────────────┤
│                                                  │
│ 🏆 ✅ Primer Paso         ⭐⭐⭐⭐⭐            │
│     Completar primer quiz                        │
│     Desbloqueado: Hace 15 días                   │
│                                                  │
│ 🏆 ✅ Racha de 3 Días    ⭐⭐⭐⭐⭐            │
│     Mantener racha por 3 días consecutivos       │
│     Desbloqueado: Hace 8 días                    │
│                                                  │
│ 🏆 ⏳ Maestro del Cráneo ⭐⭐⭐⭐⭐            │
│     Lograr 95%+ en 10 quizzes de cráneo         │
│     Progreso: 7/10 (70%)                        │
│                                                  │
│ 🏆 ❌ Perfección          ⭐⭐⭐⭐⭐            │
│     Obtener 100% en examen                      │
│     Próximamente...                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 16.5 Leaderboard / Ranking

**Vista Global:**

```
┌─────────────────────────────────────────────────┐
│ RANKING - Agosto 2026                           │
│ Actualizado: Hace 30 minutos                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🥇 1. Juan Pérez        45,230 XP  Nivel 28   │
│ 🥈 2. María López        42,100 XP  Nivel 27   │
│ 🥉 3. Carlos González    41,500 XP  Nivel 27   │
│ 4️⃣ 4. Ana Martínez      38,900 XP  Nivel 26   │
│ 5️⃣ 5. Roberto Silva     36,250 XP  Nivel 25   │
│ ...
│ 👤 45. TÚ               28,450 XP  Nivel 19   │
│       (Sube 3 posiciones con 500 XP más)      │
│ ...
│ 245.NameHere            1,200 XP   Nivel 2    │
│                                                 │
│ [VER TODO EL RANKING]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Filtros disponibles:**
- Por grupo (Agosto 2026, Septiembre 2026, etc.)
- Por tema (Cráneo, Tórax, etc.)
- Período (Hoy, Esta semana, Este mes, All-time)

---

## 17. PWA (PROGRESSIVE WEB APP)

### 17.1 Características PWA

**Requisitos técnicos:**
- ✅ HTTPS (obligatorio)
- ✅ Web App Manifest (manifest.json)
- ✅ Service Worker registrado
- ✅ Icono de app (192x192, 512x512)
- ✅ Pantalla de splash/instalación
- ✅ App theme color
- ✅ Funcionamiento offline

### 17.2 Web App Manifest

**Archivo: `public/manifest.json`**

```json
{
  "name": "Radiología con Fe",
  "short_name": "Radiología Fe",
  "description": "Aplicación educativa para aprendizaje de radiología con gamificación",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#FFD700",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Modo Estudio",
      "short_name": "Estudio",
      "description": "Acceso rápido al modo de estudio",
      "url": "/estudio",
      "icons": [
        { "src": "/icons/estudio-icon.png", "sizes": "192x192" }
      ]
    },
    {
      "name": "Modo Quiz",
      "short_name": "Quiz",
      "description": "Acceso rápido a quizzes",
      "url": "/quiz",
      "icons": [
        { "src": "/icons/quiz-icon.png", "sizes": "192x192" }
      ]
    }
  ],
  "categories": ["education", "medical"],
  "prefer_related_applications": false
}
```

### 17.3 Service Worker

**Archivo: `public/service-worker.js`**

```javascript
const CACHE_NAME = 'radiologia-con-fe-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache first, fallback to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }
        
        // Si no, hacer fetch y cachear
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback si no hay conexión
            return new Response('Offline - Contenido no disponible');
          });
      })
  );
});
```

### 17.4 Registro de Service Worker

**En `public/app.js`:**

```javascript
// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registrado:', registration);
      })
      .catch(error => {
        console.log('Error registrando SW:', error);
      });
  });
}

// Detectar instalación
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Mostrar botón "Instalar app"
  showInstallButton();
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó instalar app');
      }
      deferredPrompt = null;
    });
  }
}
```

### 17.5 Instalación en Dispositivos

**Android:**
1. Abrir en Chrome
2. Botón de menú (⋮) > "Instalar aplicación"
3. Confirmar
4. App aparece en pantalla de inicio

**iOS (Safari):**
1. Abrir en Safari
2. Botón Compartir > "Añadir a Inicio"
3. Confirmar
4. Se abre como app PWA

**Desktop (Chrome):**
1. Botón instalar (mostrado en dirección URL)
2. Confirmar
3. App se abre en ventana separada

---

## 18. BASE DE DATOS - FIRESTORE

### 18.1 Estructura de Colecciones

```
radiologia-con-fe (project)
├── users/
│   ├── {uid}
│   │   ├── profile
│   │   ├── gamification
│   │   ├── quiz_responses/
│   │   │   ├── {response_id}
│   │   │   └── ...
│   │   ├── achievements/
│   │   │   ├── {achievement_id}
│   │   │   └── ...
│   │   └── access_log/
│   │       ├── {log_id}
│   │       └── ...
│   └── ...
│
├── quizzes/
│   ├── preguntas/
│   │   ├── {pregunta_id}
│   │   └── ...
│   └── estadisticas/
│       ├── {stats_id}
│       └── ...
│
├── anatomia/
│   ├── sistemas/
│   │   ├── oseo/
│   │   │   ├── craneo/
│   │   │   ├── columna/
│   │   │   └── ...
│   │   ├── muscular/
│   │   ├── cardiovascular/
│   │   └── ...
│   └── imagenes/
│       ├── radiografias/
│       └── anatom_3d/
│
├── grupos/
│   ├── {grupo_id}
│   │   ├── estudiantes/
│   │   └── configuracion/
│   └── ...
│
├── logros/
│   ├── {logro_id}
│   └── ...
│
├── configuracion/
│   └── sistema/
│       ├── gamification_rules
│       ├── quiz_settings
│       └── access_rules
│
└── analytics/
    ├── eventos/
    │   ├── {event_id}
    │   └── ...
    └── metricas/
        ├── diarios/
        └── mensuales/
```

### 18.2 Documento Usuario

```javascript
// users/{uid}
{
  // Básico
  uid: "firebase-uid-12345",
  email: "juan@example.com",
  nombre: "Juan Pérez",
  rol: "estudiante",  // o "admin"
  createdAt: Timestamp.fromDate(new Date('2026-06-01')),
  updatedAt: Timestamp.now(),
  
  // Perfil
  avatar: "JP",  // o URL
  institucion: "Facultad de Medicina",
  grupo: "Agosto 2026",
  
  // Acceso
  acceso: {
    inicio: Timestamp.fromDate(new Date('2026-08-01')),
    fin: Timestamp.fromDate(new Date('2026-11-30')),
    activo: true
  },
  
  // Gamificación
  xp: 2450,
  nivel: 12,
  racha_actual: 7,
  racha_maxima: 15,
  ultimo_acceso: Timestamp.now(),
  
  // Estadísticas
  estadisticas: {
    quizzes_totales: 32,
    quizzes_hoy: 2,
    promedio_general: 82,
    por_tema: {
      "craneo": { intentos: 12, promedio: 85 },
      "torax": { intentos: 10, promedio: 78 },
      "abdomen": { intentos: 8, promedio: 92 },
      "pelvis": { intentos: 2, promedio: 70 }
    }
  },
  
  // Logros desbloqueados
  logros_desbloqueados: ["primer_paso", "racha_3_dias"],
  
  // Admin only
  permisos: ["crear_preguntas", "crear_estudiantes"]
}
```

### 18.3 Documento Pregunta

```javascript
// quizzes/preguntas/{pregunta_id}
{
  id: "preg-001-craneo",
  texto: "¿Qué hueso está señalado con la flecha en la radiografía?",
  
  // Categorización
  sistema: "oseo",  // índice
  tema: "craneo",    // índice
  dificultad: "intermedio",  // índice
  tipo: "multiple_choice",
  
  // Contenido
  imagen_url: "gs://radiologia-bucket/images/pregunta-001.jpg",
  explicacion: "El hueso frontal forma la frente y...",
  
  // Opciones
  opciones: [
    {
      id: "a",
      texto: "Frontal",
      es_correcta: true
    },
    {
      id: "b",
      texto: "Temporal",
      es_correcta: false
    },
    {
      id: "c",
      texto: "Parietal",
      es_correcta: false
    },
    {
      id: "d",
      texto: "Occipital",
      es_correcta: false
    }
  ],
  
  // Metadata
  tags: ["anatomía", "radiografía", "identificación"],
  createdAt: Timestamp.now(),
  createdBy: "admin-uid",
  updatedAt: Timestamp.now(),
  updatedBy: "admin-uid",
  
  // Estadísticas
  estadisticas: {
    veces_preguntada: 2450,
    veces_correcta: 1960,
    porcentaje_acierto: 0.80,
    dificultad_real: "intermedio"  // Calculado
  }
}
```

### 18.4 Documento Respuesta Quiz

```javascript
// users/{uid}/quiz_responses/{response_id}
{
  id: "resp-001",
  
  // Referencias
  pregunta_id: "preg-001-craneo",
  quiz_id: "quiz-session-001",
  user_id: "{uid}",
  
  // Respuesta
  respuesta_usuario: "a",
  es_correcta: true,
  
  // Tiempo y XP
  tiempo_respuesta: 15,  // segundos
  xp_ganado: 10,
  
  // Contexto
  modo: "estudio",  // o "examen"
  tema: "craneo",
  dificultad: "intermedio",
  
  // Timestamp
  timestamp: Timestamp.now(),
  fecha: "2026-07-02"  // indexado
}
```

### 18.5 Índices de Firestore

**Índices recomendados:**

| Colección | Campos | Tipo |
|-----------|--------|------|
| quizzes/preguntas | sistema + tema + dificultad | Compound |
| quizzes/preguntas | tema + createdAt | Compound |
| users/{uid}/quiz_responses | fecha + modo | Compound |
| users | rol + acceso.activo | Compound |
| users | grupo + nivel + xp | Compound |

---

## 19. SEGURIDAD

### 19.1 Firebase Security Rules

**Firestore Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: verificar rol
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // Colección: users
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
      
      // Subcollecciones
      match /quiz_responses/{document=**} {
        allow read: if isOwner(userId) || isAdmin();
        allow create: if isOwner(userId);
        allow update: if false;  // Respuestas no se modifican
        allow delete: if false;
      }
      
      match /achievements/{document=**} {
        allow read: if isOwner(userId) || isAdmin();
        allow write: if false;  // Sistema automático
      }
    }
    
    // Colección: quizzes/preguntas
    match /quizzes/preguntas/{preguntaId} {
      allow read: if request.auth != null;  // Cualquier usuario autenticado
      allow write: if isAdmin();
    }
    
    // Colección: configuracion
    match /configuracion/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Colección: grupos
    match /grupos/{grupoId} {
      allow read: if isAdmin() || resource.data.estudiantes[request.auth.uid] != null;
      allow write: if isAdmin();
    }
    
    // Default: denegar todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Firebase Storage Rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Imágenes públicas (radiografías, etc.)
    match /public/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.rol == 'admin';
    }
    
    // Avatares usuarios
    match /avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || request.auth.token.rol == 'admin';
    }
    
    // Admin upload area
    match /admin/{userId}/{allPaths=**} {
      allow read, write: if request.auth.token.rol == 'admin';
    }
    
    // Default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 19.2 Autenticación

**Métodos soportados:**
- Email + Contraseña (Firebase Auth)
- Google OAuth 2.0

**Requisitos de Contraseña:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 número
- Sin espacios al inicio/final

**Configuración Firebase Auth:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy... (API Key)",
  authDomain: "radiologia-con-fe.firebaseapp.com",
  projectId: "radiologia-con-fe",
  storageBucket: "radiologia-con-fe.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Persistencia de sesión
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
```

### 19.3 Validación de Acceso

**Al iniciar sesión:**

```javascript
async function loginUser(email, password) {
  try {
    // 1. Autenticar en Firebase
    const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
    
    // 2. Obtener token ID
    const token = await userCred.user.getIdToken();
    
    // 3. Verificar documento usuario en Firestore
    const userDoc = await db.collection('users').doc(userCred.user.uid).get();
    if (!userDoc.exists) {
      throw new Error('Usuario no registrado');
    }
    
    const userData = userDoc.data();
    
    // 4. Validar acceso por fechas (si es estudiante)
    if (userData.rol === 'estudiante') {
      const ahora = new Date();
      const inicio = userData.acceso.inicio.toDate();
      const fin = userData.acceso.fin.toDate();
      
      if (ahora < inicio || ahora > fin) {
        throw new Error('Acceso fuera de ventana permitida');
      }
    }
    
    // 5. Guardar datos localmente
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userCred.user.uid);
    localStorage.setItem('userRole', userData.rol);
    localStorage.setItem('userName', userData.nombre);
    
    // 6. Redirigir según rol
    if (userData.rol === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
    
  } catch (error) {
    console.error('Error login:', error);
    mostrarError(error.message);
  }
}
```

### 19.4 Protección de Datos

**HTTPS:**
- Obligatorio en producción
- Redirigir HTTP → HTTPS
- Certificado SSL válido

**No guardar localmente:**
- ❌ Contraseñas
- ❌ Datos sensibles de otros usuarios
- ❌ API keys directas

**Datos permitidos en localStorage:**
- ✅ Token JWT (Firebase IDToken)
- ✅ User ID
- ✅ Rol (admin/estudiante)
- ✅ Nombre usuario

**Limpiar al logout:**

```javascript
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  firebase.auth().signOut();
  window.location.href = '/login';
}
```

---

## 20. REQUISITOS DE RENDIMIENTO

### 20.1 Benchmarks Objetivo

| Métrica | Objetivo | Máximo |
|---------|----------|--------|
| Time to Interactive (TTI) | < 3s | 5s |
| Largest Contentful Paint (LCP) | < 2.5s | 4s |
| First Input Delay (FID) | < 100ms | 300ms |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.25 |
| Transfer Size | < 100KB | 150KB |
| DOM Elements | < 1000 | 2000 |

### 20.2 Optimizaciones

**Carga de Recursos:**
```
1. Minificar CSS y JS
2. Comprimir imágenes (WebP cuando sea posible)
3. Lazy loading de imágenes
4. Caché HTTP Headers
5. Compresión gzip en servidor
```

**Code Splitting:**
```javascript
// Cargar módulos bajo demanda
const quizModule = () => import('./modules/quiz.js');
const adminModule = () => import('./modules/admin.js');
```

**Service Worker Caching:**
- Cache first para assets estáticos
- Network first para datos dinámicos
- Invalidar cache versión a versión

### 20.3 Lighthouse Score

**Objetivo: 90+ en Lighthouse**

```
Performance: 90+
Accessibility: 95+
Best Practices: 90+
SEO: 95+
PWA: 100 (cuando es aplicable)
```

---

## 21. RESPONSIVE DESIGN

### 21.1 Breakpoints

```css
/* Mobile first */
$mobile: 320px;    /* Muy pequeño */
$tablet-sm: 480px; /* Tablets pequeñas */
$tablet: 768px;    /* Tablets estándar */
$desktop: 1024px;  /* Escritorio pequeño */
$desktop-lg: 1280px; /* Escritorio grande */
```

### 21.2 Layouts Responsivos

**Mobile (< 768px):**
- Navegación inferior (bottom nav)
- Contenido full-width
- Botones grandes (48px minimum)
- Single column

**Tablet (768px - 1023px):**
- Navegación lateral (sidebar)
- 2 columnas máximo
- Grid flexible

**Desktop (1024px+):**
- Navegación lateral fija
- 3-4 columnas posible
- Paneles lado a lado

### 21.3 Media Queries

```css
/* Mobile first */
.dashboard {
  display: flex;
  flex-direction: column;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard {
    grid-template-columns: 280px 1fr 300px;
  }
}
```

---

## 22. ACCESIBILIDAD (WCAG 2.1 AA)

### 22.1 Requisitos WCAG

**Perceivable:**
- ✅ Contraste mínimo 4.5:1 (textos)
- ✅ Alternativas de texto para imágenes
- ✅ Subtítulos para videos (futuro)

**Operable:**
- ✅ Navegable por teclado (Tab, Enter, Escape)
- ✅ Focus visible en elementos interactivos
- ✅ Sin trampas de teclado
- ✅ Sin parpadeos > 3Hz

**Comprensible:**
- ✅ Etiquetas claras en inputs
- ✅ Mensajes de error descriptivos
- ✅ Lenguaje simple

**Robusto:**
- ✅ HTML semántico
- ✅ ARIA roles donde sea necesario
- ✅ Compatible con screen readers

### 22.2 Implementación

**HTML Semántico:**
```html
<header>Logo y navegación</header>
<nav>Menú principal</nav>
<main>
  <section>
    <h1>Título</h1>
    <article>
      <h2>Subtítulo</h2>
      <p>Contenido...</p>
    </article>
  </section>
</main>
<footer>Pie de página</footer>
```

**ARIA:**
```html
<button aria-label="Cerrar" aria-expanded="false">
  <span aria-hidden="true">✕</span>
</button>

<div role="alert" aria-live="polite">
  Mensaje importante
</div>
```

**Formularios:**
```html
<label for="email">Email:</label>
<input 
  id="email" 
  type="email" 
  aria-required="true"
  aria-invalid="false"
>
<span id="email-error" role="alert"></span>
```

---

## 23. SEO Y OPTIMIZACIÓN

### 23.1 Meta Tags

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Aplicación educativa para aprendizaje de radiología con gamificación">
  <meta name="keywords" content="radiología, educación, quiz, gamificación, medicina">
  <meta name="theme-color" content="#FFD700">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- Open Graph (redes sociales) -->
  <meta property="og:title" content="Radiología con Fe">
  <meta property="og:description" content="Fe que guía, Ciencia que transforma">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://radiologiaconfe.com">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Radiología con Fe">
  <meta name="twitter:description" content="Aplicación educativa de radiología">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
  
  <title>Radiología con Fe - Aprende Radiología con Gamificación</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
```

### 23.2 Canonical URLs

```html
<link rel="canonical" href="https://radiologiaconfe.com/quiz">
```

### 23.3 Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://radiologiaconfe.com/sitemap.xml
```

---

## 24. CONVENCIONES DE CÓDIGO

### 24.1 Nomenclatura

**JavaScript:**
```javascript
// Constantes: UPPER_SNAKE_CASE
const MAX_QUIZ_TIME = 30;
const XP_PER_CORRECT = 10;

// Variables: camelCase
let userScore = 0;
let isAnswerCorrect = false;

// Funciones: camelCase, verbo
function getQuizByTopic(topic) { }
function calculateXP(difficulty) { }
function validateEmail(email) { }

// Clases: PascalCase
class QuizManager { }
class User { }

// IDs y Clases CSS: kebab-case
<div id="quiz-container" class="quiz-card">

// Data attributes: kebab-case
<button data-quiz-id="123" data-difficulty="intermediate">
```

**CSS:**
```css
/* Variables: --kebab-case */
--color-primary: #FFD700;
--space-lg: 24px;
--border-radius: 8px;

/* Clases: kebab-case */
.btn-primary { }
.card-header { }
.form-group { }

/* BEM (si es complejo) */
.quiz-card { }
.quiz-card__title { }
.quiz-card__body { }
.quiz-card--active { }
```

### 24.2 Estructura de Archivos

```javascript
// Cabecera del archivo
/**
 * Módulo: Quiz Manager
 * Descripción: Gestiona la lógica de quizzes
 * Autor: Equipo Radiología con Fe
 * Fecha: 2026-07-02
 */

// Imports
import { firebase } from '../config/firebase';
import { calculateXP } from './gamification';

// Constantes
const QUIZ_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// Clase o función principal
export class QuizManager {
  constructor() {
    // ...
  }
  
  // Métodos públicos
  public startQuiz() { }
  
  // Métodos privados
  private validateAnswer() { }
}

// Exports
export default QuizManager;
```

### 24.3 Comments

```javascript
// Comentario simple (usar en lógica clara)
const total = items.reduce((sum, item) => sum + item.price, 0);

// Comentario para sección
// ============================================
// CÁLCULO DE XP Y GAMIFICACIÓN
// ============================================

/**
 * Calcula los puntos de experiencia ganados
 * @param {number} difficulty - Nivel de dificultad (1-3)
 * @param {boolean} isCorrect - Si la respuesta es correcta
 * @returns {number} XP ganados
 */
function calculateXP(difficulty, isCorrect) {
  if (!isCorrect) return 0;
  return difficulty * 10;
}
```

### 24.4 Git Commits

**Formato:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Ejemplos:**
```
feat(quiz): add study mode with instant feedback
fix(auth): correct login validation for email format
docs(prd): update security rules section
refactor(utils): improve XP calculation algorithm
test(gamification): add unit tests for level progression
style(css): format design system variables
```

**Tipos:**
- `feat`: Característica nueva
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato/estilos
- `refactor`: Refactorización sin cambios funcionales
- `test`: Agregar/actualizar tests
- `chore`: Cambios de configuración

---

## 25. ROADMAP DE VERSIONES

### 25.1 v0.1.0 (MVP - Actual)

**Fecha objetivo:** Septiembre 2026

**Features:**
- ✅ Autenticación (Email/Google)
- ✅ Dashboard estudiante
- ✅ Sistema de Quiz (Estudio + Examen)
- ✅ 200 preguntas base
- ✅ Anatomía interactiva (6 sistemas)
- ✅ Gamificación (XP, niveles, logros)
- ✅ PWA funcional
- ✅ Panel admin básico
- ✅ Responsive design

**No incluye:**
- ❌ Reportes avanzados
- ❌ Foros de discusión
- ❌ Video tutoriales
- ❌ API pública
- ❌ Soporte offline completo para imágenes

### 25.2 v0.2.0 (Mejoras Beta)

**Fecha objetivo:** Noviembre 2026

**Features planificadas:**
- 📋 Banco de preguntas expandido (500 preguntas)
- 📊 Reportes detallados (PDF, gráficos)
- 🎯 Modo "Práctica dirigida" (por debilidades)
- 👥 Leaderboard por grupo
- 📱 Soporte offline mejorado
- 🌙 Tema claro/oscuro (light/dark)
- 📈 Analytics avanzado

### 25.3 v0.3.0 (Social)

**Fecha objetivo:** Enero 2027

**Features planificadas:**
- 💬 Foro de discusión por tema
- 🤝 Sistema de mentoría
- 🏆 Torneos entre grupos
- 📸 Compartir logros en redes
- 🔔 Notificaciones push

### 25.4 v1.0.0 (Producción)

**Fecha objetivo:** Marzo 2027

**Features:**
- 🎓 Certificados digitales
- 👨‍🏫 Modo instructor
- 📹 Video explicaciones
- 🤖 IA para generar preguntas
- 🌍 Multi-idioma
- 📊 Dashboard admin completo
- API pública

---

## 26. MÉTRICAS DE ÉXITO

### 26.1 Adopción

- **Usuarios activos mensuales (MAU):** Meta 500+ en v0.1
- **Tasa de retención (Day 7):** > 60%
- **Tasa de retención (Day 30):** > 40%
- **Sesiones diarias:** > 100

### 26.2 Engagement

- **Promedio de quizzes/usuario/semana:** 5+
- **Racha promedio:** 4+ días
- **% con logro "Racha 7 días":** > 30%
- **Tiempo promedio sesión:** 20+ minutos

### 26.3 Educativo

- **Promedio de puntuación general:** 75%+
- **% mejora de puntuación (pre-post):** 15%+
- **Cobertura de temas:** 80%+ de temas completados
- **Feedback positivo:** > 4.5/5 en reviews

### 26.4 Técnico

- **Lighthouse Score:** 90+
- **Uptime:** 99.9%
- **Error rate:** < 0.1%
- **Load time (p95):** < 2s
- **Dispositivos soportados:** 95%+ de market share

---

## 27. CHECKLIST DE CALIDAD

### 27.1 Antes de Producción (v0.1)

#### Funcionalidad
- ☑ Autenticación funciona (email + Google)
- ☑ Todos los roles funcionan sin errores
- ☑ Quizzes completos (inicio a fin)
- ☑ Cálculos de XP/niveles correctos
- ☑ Offline funciona sin conexión
- ☑ Datos persisten en Firestore
- ☑ Panel admin todas operaciones CRUD
- ☑ Imágenes cargan correctamente

#### Seguridad
- ☑ Security Rules en Firestore validadas
- ☑ Storage Rules configuradas
- ☑ No hay API keys expuestas
- ☑ HTTPS forzado
- ☑ Validación de acceso por fechas
- ☑ Tokens expiran correctamente
- ☑ No se guardan datos sensibles localmente

#### Performance
- ☑ Lighthouse 90+ (4 áreas)
- ☑ TTI < 3 segundos
- ☑ No hay memory leaks (DevTools)
- ☑ Service Worker cacheando correctamente
- ☑ Images optimizadas
- ☑ CSS/JS minificados

#### UX/Diseño
- ☑ Responsive en mobile/tablet/desktop
- ☑ Colores del design system aplicados
- ☑ Tipografías consistentes
- ☑ Espaciados consistentes
- ☑ Animaciones suaves
- ☑ Estados hover/focus visibles
- ☑ Ningún texto pequeño en mobile (< 12px)
- ☑ Botones mínimo 44x44 (mobile)

#### Accesibilidad
- ☑ Contraste 4.5:1 en textos
- ☑ Navegable por teclado
- ☑ Focus visible en todas partes
- ☑ Labels en todos inputs
- ☑ Alt text en imágenes
- ☑ Semántica HTML correcta
- ☑ ARIA roles donde sea necesario
- ☑ Lighthouse Accessibility 95+

#### SEO
- ☑ Meta description en homepage
- ☑ Open Graph tags
- ☑ Favicon presente
- ☑ Robots.txt configurado
- ☑ Sitemap.xml
- ☑ Canonical URLs
- ☑ Lighthouse SEO 95+

#### Testing
- ☑ Testeado en Chrome (90+)
- ☑ Testeado en Firefox (88+)
- ☑ Testeado en Safari (14+)
- ☑ Testeado en Edge (90+)
- ☑ Testeado en Chrome Mobile
- ☑ Testeado en Safari iOS
- ☑ Testeado en Firefox Mobile
- ☑ Testeado en conexión 3G lenta

#### Documentación
- ☑ README.md completado
- ☑ PRD.md actualizado
- ☑ API Reference documentada
- ☑ Comentarios en código crítico
- ☑ Instrucciones setup
- ☑ Variables de entorno documentadas
- ☑ Changelog actualizado

#### Data
- ☑ 200+ preguntas cargadas
- ☑ Estructuras anatómicas completas
- ☑ Imágenes radiológicas de calidad
- ☑ Logros definidos (50+)
- ☑ Datos de prueba en Firestore
- ☑ Backup de datos

### 27.2 Después de Lanzamiento

#### Monitoreo
- ☑ Analytics configurado
- ☑ Errores siendo registrados
- ☑ Performance siendo monitoreado
- ☑ Alertas configuradas

#### Mantenimiento
- ☑ Responder a errores dentro 24h
- ☑ Hacer backups regularmente
- ☑ Actualizar dependencias
- ☑ Revisar security rules mensualmente
- ☑ Responder feedback usuarios

---

## 28. RESTRICCIONES Y LIMITACIONES (v0.1)

**Capacidad:**
- Máximo 1,000 usuarios simultáneos
- Máximo 50,000 preguntas en banco
- Máximo 5GB de imágenes en Storage

**Plataformas no soportadas:**
- Internet Explorer (< Edge)
- Navegadores muy antiguos (pre-2018)

**Funciones no disponibles en v0.1:**
- Video tutoriales
- Foros de discusión
- Certificados digitales
- Sincronización de imágenes offline
- API pública
- Multi-idioma

**Requisitos de conexión:**
- Login requiere conexión
- Offline solo con datos cacheados
- Sincronización al reconectar

---

## CONCLUSIÓN

Este PRD proporciona la especificación completa para desarrollar **Radiología con Fe v0.1**, una aplicación educativa PWA que combina gamificación, anatomía interactiva y seguimiento del progreso estudiante, respaldada por Firebase.

La arquitectura está diseñada para ser:
- ✅ Escalable (de 100 a 10,000+ usuarios)
- ✅ Segura (Security Rules, validaciones)
- ✅ Performante (PWA, lazy loading, caching)
- ✅ Accesible (WCAG 2.1 AA)
- ✅ Mantenible (convenciones, documentación)

**Próximos pasos:**
1. Setup del proyecto en GitHub
2. Configurar Firebase
3. Crear estructura de carpetas
4. Implementar módulos en orden de dependencia
5. Testing exhaustivo
6. Deploy en producción

---

**Versión:** 1.0.0  
**Fecha:** 2026-07-02  
**Estado:** ✅ Listo para Desarrollo  
**Última actualización:** 2026-07-02  

---

Fe que guía, Ciencia que transforma. 🩻✨