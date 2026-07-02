# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Radiología con Fe 🩻✨

**Fe que guía, Ciencia que transforma**

**Versión:** 1.0.0  
**Fecha:** 2026-07-02  
**Estado:** Especificación Oficial de Desarrollo  
**Equipo:** TOMMYJAQUEZ Development Team  

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Identidad del Proyecto](#1-identidad-del-proyecto)
2. [Visión y Objetivos](#2-visión-y-objetivos)
3. [Descripción General](#3-descripción-general)
4. [Público Objetivo](#4-público-objetivo)
5. [Arquitectura Técnica](#5-arquitectura-técnica)
6. [Stack Tecnológico](#6-stack-tecnológico)
7. [Estructura de Carpetas](#7-estructura-de-carpetas)
8. [Sistema de Diseño](#8-sistema-de-diseño)
9. [Especificaciones Funcionales](#9-especificaciones-funcionales)
10. [Módulo de Autenticación](#10-módulo-de-autenticación)
11. [Sistema de Roles](#11-sistema-de-roles)
12. [Panel del Administrador](#12-panel-del-administrador)
13. [Módulo de Estudiantes](#13-módulo-de-estudiantes)
14. [Sistema de Anatomía](#14-sistema-de-anatomía)
15. [Sistema de Quiz](#15-sistema-de-quiz)
16. [Gamificación](#16-gamificación)
17. [PWA (Progressive Web App)](#17-pwa-progressive-web-app)
18. [Base de Datos - Firestore](#18-base-de-datos---firestore)
19. [Seguridad](#19-seguridad)
20. [Requisitos de Rendimiento](#20-requisitos-de-rendimiento)
21. [Responsive Design](#21-responsive-design)
22. [Accesibilidad](#22-accesibilidad)
23. [SEO y Optimización](#23-seo-y-optimización)
24. [Convenciones de Código](#24-convenciones-de-código)
25. [Roadmap de Versiones](#25-roadmap-de-versiones)
26. [Métricas de Éxito](#26-métricas-de-éxito)
27. [Checklist de Calidad](#27-checklist-de-calidad)

---

## 1. IDENTIDAD DEL PROYECTO

### 1.1 Nombre Oficial
**Radiología con Fe**

### 1.2 Tagline/Eslogan
**"Fe que guía, Ciencia que transforma"**

### 1.3 Descripción Ejecutiva
Radiología con Fe es una **aplicación educativa progresiva (PWA)** diseñada para facilitar el aprendizaje interactivo de radiología a través de un sistema gamificado de quizzes, visualización anatómica interactiva y seguimiento de progreso. La aplicación combina elementos de Fe (motivación, comunidad educativa) con Ciencia rigurosa (contenido basado en evidencia, anatomía precisa, radiología clínica).

### 1.4 Versión Inicial
**v0.1.0 - MVP (Minimum Viable Product)**

### 1.5 Personaje Institucional
**Nombre:** Dr. Juan Pérez (Dr. JP)  
**Rol:** Mentor y Guía del Usuario  
**Descripción Visual:**
- Radiólogo joven (30-40 años) con gafas
- Bata blanca profesional
- Expresión amable y confiable
- Iconografía: Rayos X, corazón, símbolo de radiación

**Uso del Personaje:**
- Bienvenida en pantalla de login
- Mensajes motivacionales en dashboard
- Explicaciones en modo estudio
- Felicitaciones por logros
- Orientación en exámenes

---

## 2. VISIÓN Y OBJETIVOS

### 2.1 Visión General
Ser la **plataforma educativa de referencia** para el aprendizaje de radiología en Latinoamérica, combinando tecnología educativa de punta con valores institucionales de Fe y excelencia académica.

### 2.2 Objetivos Generales (OG)

**OG1:** Proporcionar una herramienta de aprendizaje interactiva, accesible y motivante para estudiantes de medicina y radiólogos en formación.

**OG2:** Implementar un sistema de gamificación que aumente la retención de usuarios y el compromiso con el aprendizaje.

**OG3:** Crear un entorno educativo seguro, controlado y medible donde administradores puedan gestionar acceso, contenido y seguimiento.

**OG4:** Desarrollar una aplicación que funcione en dispositivos móviles, tablets y desktops con experiencia optimizada para cada uno.

### 2.3 Objetivos Específicos (OE)

**OE1 - Autenticación Segura**
- Implementar login con Google y correo/contraseña
- Integrar Firebase Authentication
- Validar roles en tiempo real
- Mantener sesiones seguras

**OE2 - Gestión de Usuarios**
- Crear panel administrativo completo
- Permitir gestión de estudiantes (crear, editar, eliminar, desactivar)
- Implementar control de acceso por fechas (ventanas de acceso)
- Generar reportes de actividad y progreso

**OE3 - Banco de Preguntas**
- Crear database de 500+ preguntas de radiología
- Organizar por sistema (óseo, muscular, cardiovascular, respiratorio, digestivo, urogenital, neurológico)
- Implementar dificultades (Básico, Intermedio, Avanzado)
- Incluir imágenes radiológicas de referencia

**OE4 - Sistema de Quiz**
- Modo Estudio: Sin límite de tiempo, feedback inmediato, sin penalización
- Modo Examen: Con tiempo límite (30 minutos), sin feedback durante, puntuación final
- Preguntas aleatorias y shuffle de opciones
- Validación automática de respuestas

**OE5 - Visualización Anatómica**
- Crear atlas interactivo de sistemas anatómicos
- Incluir radiografías de referencia
- Permitir navegación por sistemas (óseo, muscular, etc.)
- Mostrar información detallada por estructura

**OE6 - Gamificación**
- Sistema de XP (Experience Points)
- Niveles (1-50)
- Logros/Badges (50+ tipos)
- Racha diaria (racha actual en días)
- Leaderboard/Ranking

**OE7 - Dashboard Personalizado**
- Mostrar progreso general
- Estadísticas por tema
- Puntuación actual y meta
- Racha y próximo nivel
- Resumen de logros

**OE8 - PWA y Accesibilidad Offline**
- Instalación como app nativa
- Funcionamiento offline
- Service Worker implementado
- Sincronización automática al conectar

---

## 3. DESCRIPCIÓN GENERAL

### 3.1 Propuesta de Valor

**Para Estudiantes:**
- ✅ Aprendizaje interactivo y motivante con gamificación
- ✅ Feedback inmediato en modo estudio
- ✅ Visualización clara de progreso
- ✅ Comunidad de aprendizaje (leaderboard)
- ✅ Acceso 24/7, disponible offline
- ✅ Sistema adaptativo de dificultad

**Para Administradores/Instituciones:**
- ✅ Control total de acceso (por fechas, grupos)
- ✅ Seguimiento detallado del progreso estudiantil
- ✅ Gestión de contenido (preguntas, imágenes)
- ✅ Reportes académicos y estadísticas
- ✅ Plataforma segura con roles diferenciados
- ✅ Escalable a múltiples grupos/cohortes

### 3.2 Diferenciadores Clave

1. **Gamificación Completa** - No solo puntos, sino un sistema integral (XP, niveles, logros, racha, leaderboard)
2. **Modo Estudio vs Examen** - Dos experiencias diferentes según necesidad
3. **Anatomía Interactiva** - Visualización clara con radiografías reales
4. **PWA Funcional** - App instalable, offline, sin app store
5. **Enfoque Institucional** - Diseño profesional, no "juego gamificado"
6. **Panel Admin Robusto** - Control granular del contenido y acceso

### 3.3 Competencia y Posicionamiento

**Competitors:**
- Kahoot (gamificación general, no médica)
- Coursera (cursos, no quizzes gamificados)
- Quizlet (flashcards, no radiología específica)
- Apps médicas genéricas

**Nuestra Ventaja:**
- Diseño específico para radiología
- Gamificación educativa profesional
- Control administrativo completo
- Contenido actualizado y validado

---

## 4. PÚBLICO OBJETIVO

### 4.1 Usuarios Primarios

**Estudiantes de Medicina (4to-6to año)**
- Edad: 22-28 años
- Ubicación: Latinoamérica (enfoque inicial)
- Objetivo: Aprobar rotación de radiología, preparar exámenes
- Dispositivos: Móvil (70%), Tablet (20%), Desktop (10%)
- Tiempo disponible: 30-60 minutos diarios

**Radiólogos Residentes**
- Edad: 26-35 años
- Objetivo: Mejorar habilidades, preparar certificaciones
- Dispositivos: Variado
- Tiempo: 1-2 horas diarias

### 4.2 Usuarios Secundarios

**Docentes/Administradores**
- Rol: Gestionar acceso, monitor progreso
- Dispositivos: Desktop/Laptop preferentemente
- Habilidades técnicas: Media

**Directivos Institucionales**
- Rol: Ver reportes, tomar decisiones
- Dispositivos: Desktop, ocasionalmente tablet
- Interés: Métricas, ROI, adopción

### 4.3 Análisis de Usuarios

**Motivaciones:**
- Pasar exámenes
- Mejorar competencias
- Competencia saludable (leaderboard)
- Reconocimiento (logros)

**Pain Points:**
- Falta de tiempo
- Contenido desorganizado
- Sin feedback
- Difícil medir progreso
- Plataformas complicadas

**Comportamientos:**
- Estudian en móvil durante transporte
- Practican en la noche
- Se motivan con logros visibles
- Comparten logros en redes

---

## 5. ARQUITECTURA TÉCNICA

### 5.1 Diagrama Arquitectónico

```
┌─────────────────────────────────────────────────┐
│          CLIENTE (PWA)                          │
│  ┌──────────────────────────────────────────┐   │
│  │ HTML5 + CSS3 + ES2024 JavaScript         │   │
│  │ Service Worker | Local Storage | Cache   │   │
│  └──────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │   Firebase SDK      │
        └──────────┬──────────┘
                   │
        ┌──────────┴───────────────────────┐
        │                                  │
   ┌────▼─────┐  ┌──────────┐  ┌────────▼─────┐
   │  AUTH    │  │ FIRESTORE│  │   STORAGE    │
   │ (Login)  │  │ (Data)   │  │   (Images)   │
   └────┬─────┘  └──────────┘  └──────────────┘
        │
   ┌────▼──────────────────┐
   │  Security Rules      │
   │  (Validación Backend) │
   └──────────────────────┘
```

### 5.2 Componentes Principales

**Frontend (Cliente)**
- Capa de Presentación: HTML5, CSS3, componentes visuales
- Capa de Lógica: ES2024, módulos, controladores
- Capa de Data: Local Storage, IndexedDB, Firestore SDK
- Service Worker: Offline, cache, sincronización

**Backend (Firebase)**
- Authentication: Login seguro, gestión de sesiones
- Firestore: Base de datos NoSQL en tiempo real
- Storage: Almacenamiento de imágenes y recursos
- Security Rules: Validación de permisos en backend

### 5.3 Flujo de Datos

1. **Autenticación**
   ```
   Usuario → Firebase Auth → Token JWT → Almacenar local
   ```

2. **Lectura de Datos**
   ```
   App → Local Storage → Si existe, usar | Si no, Firestore
   Firestore → Cache local → Mostrar UI
   ```

3. **Envío de Datos**
   ```
   Usuario interacción → Local Storage → Sincronizar a Firestore
   Validar Security Rules → Guardar → Confirmar
   ```

4. **Offline**
   ```
   Sin conexión → Usar datos cached → Sincronizar cuando hay red
   ```

---

## 6. STACK TECNOLÓGICO

### 6.1 Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| HTML5 | 5.0 | Estructura semántica |
| CSS3 | 3.0 | Estilos, flexbox, grid, animaciones |
| JavaScript | ES2024 | Lógica, módulos, async/await |
| Firebase SDK | Latest | Auth, Firestore, Storage |
| Service Worker | Standard | PWA, offline, cache |

### 6.2 Backend (Firebase)

| Servicio | Función | Plan |
|----------|---------|------|
| Firebase Auth | Autenticación | Spark (gratuito) |
| Firestore | Base de datos NoSQL | Pago por uso |
| Firebase Storage | Almacenamiento archivos | Pago por uso |
| Firestore Security Rules | Validación permisos | Incluido |

### 6.3 Herramientas de Desarrollo

```
Control de Versiones: Git + GitHub
Editor: VS Code recomendado
Formato: Prettier (opcional)
Linting: ESLint (opcional)
Testing: Jest (futuro)
Deploy: Firebase Hosting (opcional) o servidor propio
```

### 6.4 Navegadores Soportados

| Navegador | Versión Mínima | Soporte |
|-----------|----------------|----------|
| Chrome | 90+ | ✅ Total |
| Firefox | 88+ | ✅ Total |
| Safari | 14+ | ✅ Total |
| Edge | 90+ | ✅ Total |
| Chrome Mobile | 90+ | ✅ Total |
| Safari iOS | 14+ | ✅ Total |
| Firefox Mobile | 88+ | ✅ Total |

---

## 7. ESTRUCTURA DE CARPETAS

### 7.1 Árbol Completo

```
radiologiaconfeapp/
├── README.md                          # Documentación principal
├── .gitignore                         # Archivos a ignorar
├── .env.example                       # Variables de entorno template
├── package.json                       # Dependencias (si aplica)
├── manifest.json                      # PWA manifest
│
├── docs/                              # Documentación del proyecto
│   ├── PRD.md                         # Este archivo
│   ├── DESIGN_SYSTEM.md               # Sistema de diseño
│   ├── ARCHITECTURE.md                # Detalles arquitectónicos
│   ├── API_REFERENCE.md               # Referencia de APIs
│   ├── CONTRIBUTING.md                # Guía de contribución
│   └── CHANGELOG.md                   # Historial de cambios
│
├── config/                            # Configuración
│   ├── firebase-config.js             # Firebase initialization
│   ├── constants.js                   # Constantes de la app
│   └── environment.js                 # Configuración por ambiente
│
├── public/                            # Archivos estáticos
│   ├── index.html                     # Punto de entrada HTML
│   ├── manifest.json                  # PWA manifest (copia)
│   ├── service-worker.js              # Service Worker
│   ├── app.css                        # Estilos globales
│   ├── app.js                         # Punto de entrada JS
│   │
│   ├── icons/                         # Iconos de app
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   ├── icon-maskable-192x192.png
│   │   └── icon-maskable-512x512.png
│   │
│   ├── screenshots/                   # Screenshots para PWA
│   │   ├── screenshot-1.png
│   │   └── screenshot-2.png
│   │
│   └── assets/                        # Assets globales
│       ├── images/
│       │   ├── logo.svg
│       │   ├── doctor-juan.svg        # Personaje Dr. Juan
│       │   └── radiacion-icon.svg
│       ├── fonts/
│       │   ├── poppins-regular.woff2
│       │   ├── poppins-bold.woff2
│       │   └── poppins-semibold.woff2
│       └── animations/
│           └── transitions.css
│
├── src/                               # Código fuente
│   │
│   ├── html/                          # Plantillas HTML
│   │   ├── login.html                 # Pantalla de login
│   │   ├── dashboard.html             # Dashboard estudiante
│   │   ├── anatomia.html              # Anatomía interactiva
│   │   ├── quiz-mode.html             # Selector estudio/examen
│   │   ├── quiz.html                  # Interfaz quiz
│   │   ├── resultados.html            # Resultados quiz
│   │   ├── perfil.html                # Perfil usuario
│   │   └── admin/
│   │       ├── admin-dashboard.html   # Dashboard admin
│   │       ├── estudiantes.html       # Gestión estudiantes
│   │       ├── banco-preguntas.html   # Gestión preguntas
│   │       ├── reportes.html          # Reportes
│   │       └── configuracion.html     # Configuración
│   │
│   ├── css/                           # Estilos
│   │   ├── design-system.css          # Variables, tema
│   │   ├── base.css                   # Estilos base
│   │   ├── components.css             # Componentes UI
│   │   ├── layout.css                 # Layouts flexbox/grid
│   │   ├── responsive.css             # Media queries
│   │   ├── animations.css             # Keyframes, transiciones
│   │   └── themes/
│   │       ├── dark.css               # Tema oscuro
│   │       └── light.css              # Tema claro (futuro)
│   │
│   ├── js/                            # JavaScript
│   │   ├── main.js                    # Inicialización app
│   │   ├── router.js                  # Sistema de rutas
│   │   │
│   │   ├── modules/
│   │   │   ├── auth.js                # Autenticación
│   │   │   ├── firestore.js           # Operaciones Firestore
│   │   │   ├── storage.js             # Almacenamiento local
│   │   │   ├── quiz.js                # Lógica de quiz
│   │   │   ├── gamification.js        # Sistema gamificación
│   │   │   ├── anatomia.js            # Módulo anatomía
│   │   │   ├── user.js                # Gestión usuario
│   │   │   ├── admin.js               # Funciones admin
│   │   │   └── analytics.js           # Eventos y métricas
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth-controller.js     # Controlador auth
│   │   │   ├── dashboard-controller.js
│   │   │   ├── quiz-controller.js
│   │   │   ├── admin-controller.js
│   │   │   └── perfil-controller.js
│   │   │
│   │   ├── components/
│   │   │   ├── navbar.js              # Componente navbar
│   │   │   ├── quiz-card.js           # Componente quiz
│   │   │   ├── progress-bar.js        # Barra progreso
│   │   │   ├── badge-display.js       # Mostrar logros
│   │   │   └── leaderboard.js         # Ranking
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js          # Validaciones
│   │   │   ├── formatters.js          # Formato de datos
│   │   │   ├── date-utils.js          # Funciones fecha
│   │   │   ├── constants.js           # Constantes locales
│   │   │   └── helpers.js             # Funciones auxiliares
│   │   │
│   │   ├── data/
│   │   │   ├── sistemas-anatomicos.js # Definición sistemas
│   │   │   ├── logros.js              # Definición logros
│   │   │   └── dificultades.js        # Niveles dificultad
│   │   │
│   │   └── adapters/
│   │       ├── firebase-adapter.js    # Adaptador Firebase
│   │       └── storage-adapter.js     # Adaptador Storage
│   │
│   └── data/                          # Datos embebidos
│       ├── preguntas-muestra.json     # Preguntas de ejemplo
│       ├── sistemas-anatomicos.json   # Sistemas anatómicos
│       └── logros-definicion.json     # Definición de logros
│
├── tests/                             # Pruebas (futuro)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── .github/                           # GitHub config
    ├── workflows/
    │   ├── deploy.yml
    │   └── tests.yml
    └── ISSUE_TEMPLATE/

```

### 7.2 Descripción por Carpeta

**`/docs`** - Documentación del proyecto
- Guías de desarrollo
- Especificaciones técnicas
- Diagramas arquitectónicos

**`/config`** - Archivos de configuración
- Firebase credentials
- Constantes de la app
- Configuración por ambiente

**`/public`** - Archivos accesibles públicamente
- HTML entry point
- PWA manifest
- Service Worker
- Assets estáticos (imágenes, fonts)

**`/src`** - Código fuente principal
- HTML templates
- CSS organizado por dominio
- JavaScript en arquitectura modular

**`/src/js/modules`** - Módulos funcionales
- Cada módulo es responsable de un dominio
- Expone API pública clara
- Manejo de errores interno

**`/src/js/controllers`** - Controladores
- Orquestación entre módulos
- Manejo de eventos UI
- Navegación

---

## 8. SISTEMA DE DISEÑO

### 8.1 Paleta de Colores

**Colores Primarios:**
```css
--color-primary: #FFD700          /* Amarillo dorado (CTA, highlights) */
--color-primary-dark: #D4AF37     /* Amarillo más oscuro (hover) */
--color-primary-light: #FFF44F    /* Amarillo más claro (backgrounds) */
```

**Colores Secundarios:**
```css
--color-secondary-dark: #1A1A1A   /* Gris oscuro (backgrounds, textos) */
--color-secondary-gray: #2D2D2D   /* Gris medio (borders, separadores) */
--color-secondary-light: #4A4A4A  /* Gris claro (elementos secundarios) */
```

**Colores Funcionales:**
```css
--color-success: #4CAF50           /* Verde (respuestas correctas) */
--color-error: #F44336             /* Rojo (respuestas incorrectas) */
--color-warning: #FF9800           /* Naranja (advertencias) */
--color-info: #2196F3              /* Azul (información) */
--color-text-primary: #FFFFFF      /* Blanco (textos principales) */
--color-text-secondary: #B0B0B0    /* Gris claro (textos secundarios) */
--color-background: #0D0D0D        /* Negro muy oscuro (fondo) */
--color-surface: #1A1A1A           /* Negro oscuro (cards, modales) */
```

### 8.2 Tipografías

**Familia Principal: Poppins**
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Pesos disponibles:**
- Regular (400) - Textos cuerpo
- Medium (500) - Etiquetas
- Semibold (600) - Subtítulos
- Bold (700) - Títulos

**Escala Tipográfica:**

| Tipo | Tamaño | Peso | Uso |
|------|--------|------|-----|
| H1 | 32px | Bold (700) | Títulos principales |
| H2 | 28px | Bold (700) | Títulos secciones |
| H3 | 24px | Semibold (600) | Subtítulos |
| H4 | 20px | Semibold (600) | Encabezados pequeños |
| Body Large | 16px | Regular (400) | Texto principal |
| Body | 14px | Regular (400) | Texto cuerpo |
| Small | 12px | Regular (400) | Labels, hints |
| Tiny | 11px | Regular (400) | Metadata |

**Line Heights:**
```css
--line-height-tight: 1.2      /* Títulos */
--line-height-normal: 1.5     /* Cuerpo */
--line-height-relaxed: 1.8    /* Textos largos */
```

### 8.3 Espaciado (Spacing Scale)

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

**Uso:**
- Márgenes entre secciones: `--space-xl` a `--space-3xl`
- Padding interno de componentes: `--space-md` a `--space-lg`
- Espaciado entre elementos: `--space-sm` a `--space-md`

### 8.4 Esquinas Redondeadas (Border Radius)

```css
--radius-none: 0
--radius-sm: 4px         /* Bordes mínimos */
--radius-md: 8px         /* Estándar */
--radius-lg: 16px        /* Cards, modales */
--radius-xl: 24px        /* Componentes grandes */
--radius-full: 9999px    /* Píldoras, avatares */
```

### 8.5 Sombras (Elevation)

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.15)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.2)
--shadow-glow: 0 0 20px rgba(255,215,0,0.3)  /* Glow amarillo */
```

### 8.6 Transiciones y Animaciones

**Velocidades estándar:**
```css
--transition-fast: 150ms
--transition-normal: 300ms
--transition-slow: 500ms

Timing function: cubic-bezier(0.4, 0, 0.2, 1)  /* ease-in-out */
```

**Animaciones principales:**
- `fadeIn` - Aparición suave (300ms)
- `slideUp` - Deslizamiento desde abajo (300ms)
- `bounce` - Rebote (600ms)
- `pulse` - Pulso (2s, infinita)
- `spin` - Rotación (2s, infinita)

### 8.7 Componentes del Design System

**Botones:**
- Primary (Amarillo fondo, efecto glow)
- Secondary (Borde amarillo, fondo transparente)
- Ghost (Sin borde, solo texto)
- Size: Small, Medium, Large
- Estados: Default, Hover, Active, Disabled

**Cards:**
- Background: `--color-surface`
- Border: `1px solid --color-secondary-gray`
- Padding: `--space-lg`
- Border Radius: `--radius-lg`
- Shadow: `--shadow-md`

**Inputs:**
- Border color: `--color-secondary-gray`
- Placeholder: `--color-text-secondary`
- Focus: Borde amarillo, glow
- Height: 44px (accesibilidad móvil)

**Badges/Logros:**
- Background: Gradiente dorado (radiología)
- Icono + Texto
- Size: 80x80px estándar
- Animación entrada: `bounce`

**Progress Bars:**
- Fondo: `--color-secondary-light`
- Barra: Gradiente amarillo a naranja
- Height: 8px
- Border Radius: `--radius-full`

---

## 9. ESPECIFICACIONES FUNCIONALES

### 9.1 Flujo General de la Aplicación

```
┌─────────────┐
│   INICIO    │ (Sin autenticar)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  PANTALLA LOGIN  │ ◄─ Opción: Google / Email+Pass
└──────┬───────────┘
       │
       ├─► [Éxito] ▼
       │   ┌────────────────────┐
       │   │ VALIDAR ROL        │
       │   └────┬───────────────┘
       │        │
       │   ┌────┴────┐
       │   │          │
       │   ▼          ▼
       │  ADMIN     ESTUDIANTE
       │   │          │
       │   ▼          ▼
       │ ADMIN-   DASHBOARD
       │ DASH     ESTUDIANTE
       │   │          │
       │   ├──┐   ┌───┤
       │   │  └─┬─┘   │
       │   ▼    ▼     ▼
       │ [Múltiples opciones de navegación...]
       │
       └─► [Error] ▼
           ┌──────────────┐
           │ ERROR MESSAGE│
           └──────────────┘
```

### 9.2 Navegación Principal

**Barra de Navegación Inferior (Mobile) / Lateral (Desktop)**

Opciones para Estudiante:
1. 🏠 **Inicio** - Dashboard principal
2. 📚 **Estudio** - Anatomía interactiva
3. ❓ **Quiz** - Modo estudio/examen
4. 👤 **Perfil** - Información usuario

Opciones para Admin (Pestañas):
1. 📊 **Dashboard** - Resumen general
2. 👥 **Estudiantes** - Gestión
3. ❓ **Preguntas** - Banco de preguntas
4. 📈 **Reportes** - Estadísticas
5. ⚙️ **Configuración** - Sistema

---

## 10. MÓDULO DE AUTENTICACIÓN

### 10.1 Pantalla de Login

**Componentes Visuales:**
- Logo "Radiología con Fe" (top)
- Personaje Dr. Juan Pérez (centro, 200x200px)
- Bienvenida: "¡HOLA, JUAN!" (personalizado)
- Eslogan: "Fe que guía, Ciencia que transforma"
- Input Email (44px height)
- Input Contraseña (44px height)
- Botón "INICIAR SESIÓN" (Primary, full-width)
- Texto "Continuar con Google" + Botón Google
- Link "¿Olvidaste tu contraseña?" (texto pequeño)
- Link "Crear cuenta" (para futuro)

**Validaciones:**
- Email: Formato válido (RFC 5322)
- Contraseña: Mínimo 8 caracteres
- Ambos campos requeridos
- Mostrar errores inline

**Flujo:**
1. Usuario ingresa email/contraseña
2. Click "INICIAR SESIÓN"
3. Enviar a Firebase Auth
4. Si éxito: Guardar token en localStorage, obtener rol
5. Si rol = "admin" → Ir a `/admin`
6. Si rol = "estudiante" → Ir a `/dashboard`
7. Si error: Mostrar mensaje ("Credenciales inválidas")

**Soporte Google Login:**
1. Click botón Google
2. Popup/Redirect a Google
3. Usuario autoriza
4. Firebase devuelve token
5. Buscar en Firestore si usuario existe
6. Si no existe: Crear documento
7. Navegar según rol

### 10.2 Recuperación de Contraseña

**Flujo:**
1. Usuario click "¿Olvidaste tu contraseña?"
2. Modal con input email
3. Validar email existe en Firebase
4. Enviar email reset (Firebase automatiza)
5. Mostrar "Revisa tu correo"
6. Usuario click link, cambia password
7. Redirige a login

### 10.3 Gestión de Sesión

**Token Management:**
```javascript
// Al login exitoso
localStorage.setItem('authToken', token);
localStorage.setItem('userId', userId);
localStorage.setItem('userRole', role);
localStorage.setItem('userName', name);

// Al logout
localStorage.removeItem('authToken');
localStorage.removeItem('userId');
localStorage.removeItem('userRole');
localStorage.removeItem('userName');

// Verificación al cargar app
if (localStorage.getItem('authToken')) {
  // Validar token con Firebase
  // Si válido, cargar usuario
  // Si inválido, ir a login
}
```

**Tiempo de Sesión:**
- Token válido: 1 hora
- Refresh automático: Si está activo
- Logout automático: Si inactivo 1 hora

### 10.4 Seguridad

- ✅ HTTPS obligatorio
- ✅ No guardar contraseñas localmente (solo Firebase)
- ✅ Token en localStorage (no cookie vulnerable a CSRF en PWA)
- ✅ Validación de rol en cada navegación
- ✅ Security Rules en Firestore
- ✅ No exponer API keys en frontend (cifrar o usar backend proxy)

---

## 11. SISTEMA DE ROLES

### 11.1 Rol: ESTUDIANTE

**Permisos:**
- ✅ Ver dashboard personal
- ✅ Acceder a módulo anatomía
- ✅ Realizar quizzes (modo estudio y examen)
- ✅ Ver progreso personal
- ✅ Ver perfil y estadísticas
- ✅ Ver leaderboard (ranking)
- ✅ Ver logros personales
- ✅ Acceder solo durante ventana de acceso asignada

**Restricciones:**
- ❌ Crear preguntas
- ❌ Ver datos de otros estudiantes
- ❌ Acceder a panel admin
- ❌ Modificar su propia información (excepto avatar)
- ❌ Ver resultados fuera de su ventana

**Validaciones:**
```
Si actual_time < access_window_start → "Acceso no disponible aún"
Si actual_time > access_window_end → "Acceso ha terminado"
Si role ≠ "estudiante" → Redirigir a login
```

### 11.2 Rol: ADMINISTRADOR

**Permisos:**
- ✅ Ver dashboard con métricas globales
- ✅ Crear, editar, eliminar estudiantes
- ✅ Asignar ventanas de acceso a estudiantes
- ✅ Crear, editar, eliminar preguntas
- ✅ Subir imágenes radiológicas
- ✅ Ver reportes de progreso de todos
- ✅ Ver leaderboard global
- ✅ Configurar parámetros de gamificación
- ✅ Acceso 24/7 (sin restricción de tiempo)

**Restricciones:**
- ❌ Eliminar datos históricos
- ❌ Editar resultados de quizzes
- ❌ Ver contraseñas de estudiantes

**Validaciones:**
```
Si role ≠ "admin" → Bloquear acceso a /admin
Todas las operaciones requieren validación en Firestore Security Rules
```

### 11.3 Estructura de Documento Usuario en Firestore

```javascript
{
  uid: "firebase-uid",
  email: "juan@example.com",
  nombre: "Juan Pérez",
  rol: "estudiante" | "admin",
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Solo Estudiante
  grupo: "Agosto 2026",
  acceso: {
    inicio: timestamp,
    fin: timestamp,
    activo: boolean
  },
  
  // Gamificación (Estudiante)
  xp: 0,
  nivel: 1,
  racha_actual: 0,
  ultimo_acceso: timestamp,
  avatar: "url-o-emoji",
  
  // Admin
  permisos: ["crear_preguntas", "crear_estudiantes", ...]
}
```

---

## 12. PANEL DEL ADMINISTRADOR

### 12.1 Estructura del Panel Admin

```
┌─────────────────────────────────────────────────────┐
│ ADMIN PANEL - Radiología con Fe                    │
├──────────────┬──────────────────────────────────────┤
│ Menu Lateral │                                      │
│              │    DASHBOARD ADMIN                   │
│ • Dashboard  │  ┌───────────────────────────────┐  │
│ • Estudiantes│  │ Resumen Rápido               │  │
│ • Preguntas  │  │ - Total Estudiantes: 245     │  │
│ • Reportes   │  │ - Quizzes Realizados: 1,250  │  │
│ • Config     │  │ - Promedio: 78%              │  │
│ • Logout     │  │ - Racha actual máx: 15 días  │  │
│              │  └───────────────────────────────┘  │
│              │                                      │
│              │  Gráficos de Progreso               │
│              │  [Gráfico actividad por día]        │
│              │  [Gráfico por dificultad]           │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 12.2 Dashboard Administrativo

**Widgets Principales:**

1. **KPIs Rápidos** (4 cards)
   - Total Estudiantes (activos)
   - Quizzes Completados (totales)
   - Tasa de Éxito Promedio (%)
   - Racha Máxima (días)

2. **Gráfico de Actividad**
   - Línea: Accesos por día (últimos 30 días)
   - Eje X: Fechas
   - Eje Y: Número accesos

3. **Distribución de Dificultad**
   - Pie/Donut: % quizzes por dificultad (Básico, Intermedio, Avanzado)

4. **Top 5 Temas**
   - Tabla: Tema | Preguntas | Promedio

5. **Estudiantes Activos Hoy**
   - Tabla: Nombre | Quizzes | Última Actividad

### 12.3 Gestión de Estudiantes

**Vista List:**
```
┌────────────────────────────────────────────────────┐
│ GESTIÓN DE ESTUDIANTES                            │
│ [+ CREAR NUEVO]  [Filtrar] [Descargar CSV]        │
├────────────────────────────────────────────────────┤
│ Nombre       │ Email            │ Grupo    │ Acciones
├────────────────────────────────────────────────────┤
│ Juan Pérez   │ juan@med.com     │ Ago 2026 │ [✏️][👁][🗑]
│ María López  │ maria@med.com    │ Ago 2026 │ [✏️][👁][🗑]
│ ...          │                  │          │
└────────────────────────────────────────────────────┘
```

**Acciones:**
- ✏️ Editar: Cambiar datos, ventana de acceso, grupo
- 👁 Ver: Detalle completo, progreso, quizzes
- 🗑 Eliminar: Con confirmación
- 📊 Ver Reportes: Gráficos de progreso

**Crear Nuevo Estudiante:**
- Form: Nombre, Email, Grupo, Fecha inicio acceso, Fecha fin acceso
- Botón: "CREAR ESTUDIANTE"
- Genera automáticamente contraseña temporal (enviada por email)

**Importar Masivo:**
- Opción: Subir CSV
- Formato: nombre,email,grupo,fecha_inicio,fecha_fin
- Valida y muestra preview
- Confirmación antes de crear

### 12.4 Banco de Preguntas

**Vista List:**
```
┌──────────────────────────────────────────────────┐
│ BANCO DE PREGUNTAS (2,345 total)                 │
│ [+ CREAR] [Filtrar] [Importar] [Exportar]        │
├──────────────────────────────────────────────────┤
│ # │ Pregunta           │ Sistema  │ Difícil │ 
├──────────────────────────────────────────────────┤
│1  │ ¿Qué hueso...?     │ Óseo     │ Básico  │ [✏][🗑]
│2  │ En la radiografía..│ Pulmonar │ Intermedio
│   │                    │          │         │
└──────────────────────────────────────────────────┘
```

**Crear/Editar Pregunta:**

Form completo:
1. **Pregunta** (texto área)
2. **Sistema** (select: Óseo, Muscular, Pulmonar, Cardiovascular, Digestivo, Urogenital, Neurológico)
3. **Dificultad** (radio: Básico, Intermedio, Avanzado)
4. **Tipo** (Multiple Choice, V/F)
5. **Opciones/Respuestas:**
   - Opción 1 (texto + subir imagen opcional)
   - Opción 2
   - Opción 3
   - Opción 4
6. **Respuesta Correcta** (radio)
7. **Explicación** (texto área)
8. **Imagen Referencia** (upload)
9. **Tags** (múltiple select)

**Importar Banco de Preguntas:**
- Formato: JSON o CSV
- Validación de estructura
- Preview antes de confirmar
- Duplicados: Opción de reemplazar o saltar

### 12.5 Reportes y Estadísticas

**Reportes Disponibles:**

1. **Reporte de Progreso Individual**
   - Estudiante → Fecha inicio → Fecha fin
   - Genera PDF con: XP por fecha, niveles alcanzados, logros, promedio quizzes

2. **Reporte de Grupo**
   - Grupo → Fecha
   - Tabla: Estudiante, XP, Nivel, Quizzes, Promedio, Estado
   - Gráficos de distribución

3. **Reporte de Desempeño por Tema**
   - Tabla: Tema, # Preguntas, # Intentos, % Acierto, Tiempo Promedio
   - Gráfico de barras

4. **Reporte de Acceso**
   - Calendarios heatmap: Día → Intensidad uso
   - Horarios pico de acceso
   - Tasa de abandono

5. **Reporte de Logros**
   - Tabla: Logro, % Desbl Usuarios, Primero en Desbloquear

**Exportar Reportes:**
- PDF con logos e identidad visual
- CSV para análisis en Excel
- Gráficos embebidos en PDF

### 12.6 Configuración del Sistema

**Parámetros Configurables:**

```
┌─────────────────────────────────┐
│ CONFIGURACIÓN SISTEMA           │
├─────────────────────────────────┤
│ GAMIFICACIÓN                    │
│ ├─ XP por respuesta correcta: 10
│ ├─ XP por quiz completado: 50
│ ├─ XP bonus racha: 5 × racha_actual
│ ├─ Preguntas para subir nivel: 100
│ └─ Reset racha después de (días): 1
│                                 │
│ QUIZZES                         │
│ ├─ Tiempo límite modo examen: 30 min
│ ├─ Preguntas por quiz: 20
│ ├─ Shuffle opciones: ON
│ └─ Mostrar respuestas al terminar: ON
│                                 │
│ ACCESO                          │
│ ├─ Máx intentos fallidos login: 5
│ ├─ Bloqueo después de (min): 15
│ └─ Requerir email verificado: ON
│                                 │
│ [GUARDAR CAMBIOS]               │
└─────────────────────────────────┘
```

---

## 13. MÓDULO DE ESTUDIANTES

### 13.1 Dashboard del Estudiante

**Estructura Visual:**

```
┌───────────────────────────────────────┐
│ Bienvenida: ¡Hola, Juan! 👋          │
│ Grupo: Agosto 2026 | Acceso: Activo  │
├───────────────────────────────────────┤
│                                       │
│  PROGRESO NIVEL                       │
│  [=========>....] 2,450 / 3,000 XP    │
│  Nivel 12 | Siguiente nivel: 550 XP  │
│                                       │
├───────────────────────────────────────┤
│  RACHA ACTUAL: 7 días 🔥              │
│  Próximo logro: 10 días               │
├───────────────────────────────────────┤
│  ESTADÍSTICAS GENERALES               │
│  ┌─────────────────────────────────┐  │
│  │ Quizzes: 32 │ Promedio: 82%    │  │
│  │ Últimas 7 días: 5 quizzes       │  │
│  │ Racha máxima: 15 días           │  │
│  └─────────────────────────────────┘  │
│                                       │
├───────────────────────────────────────┤
│  ACCIONES RÁPIDAS                     │
│  [COMENZAR QUIZ] [ESTUDIAR] [LOGROS] │
│                                       │
├───────────────────────────────────────┤
│  RENDIMIENTO POR TEMA                 │
│  Cráneo: 85% ████████░░              │
│  Tórax: 78% ███████░░░               │
│  Abdomen: 92% █████████░             │
│  Pelvis: 70% ███████░░░░             │
│                                       │
├───────────────────────────────────────┤
│  ÚLTIMOS QUIZZES                      │
│  ✅ Cráneo (25/30) - Hoy, 14:30      │
│  ✅ Tórax (23/30) - Ayer, 10:15      │
│  ❌ Abdomen (15/20) - Martes, 9:00   │
│                                       │
└───────────────────────────────────────┘
```

### 13.2 Navegación Estudiante

**Barra Inferior (Mobile) / Lateral (Desktop):**

1. **🏠 Inicio**
   - Dashboard principal con resumen
   - Acciones rápidas
   - Motivacional (Dr. Juan mensaje)

2. **📚 Estudio (Anatomía)**
   - Visualización interactiva
   - Detalles de estructuras
   - Sin evaluación

3. **❓ Quiz**
   - Selector Modo Estudio / Examen
   - Lista de quizzes disponibles
   - Comenzar quiz

4. **👤 Perfil**
   - Información personal
   - Logros desbloqueados
   - Estadísticas completas
   - Editar avatar

---

**Continuará en Parte 2...**

Este es el primer tercio del PRD. Las próximas secciones incluirán:
- Sistema de Anatomía
- Sistema de Quiz detallado
- Gamificación completa
- PWA y offline
- Firebase Firestore
- Seguridad
- Responsive Design
- Accesibilidad
- Roadmap
- Checklist de Calidad