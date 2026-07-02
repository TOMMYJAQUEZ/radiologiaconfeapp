# Radiología con Fe 🩻✨

**Fe que guía, Ciencia que transforma**

Aplicación educativa PWA (Progressive Web App) para el aprendizaje interactivo de radiología con gamificación, diseñada para estudiantes de medicina y radiólogos en formación.

## 📋 Contenido del Repositorio

- **`/docs`** - Documentación completa del proyecto
  - `PRD.md` - Product Requirements Document (especificación oficial)
  - `DESIGN_SYSTEM.md` - Sistema de diseño y componentes
  - `ARCHITECTURE.md` - Arquitectura técnica
  - `API_REFERENCE.md` - Referencia de API y Firebase

- **`/src`** - Código fuente de la aplicación
  - `/html` - Plantillas HTML5
  - `/css` - Estilos CSS3 (componentes, temas, responsive)
  - `/js` - JavaScript ES2024 (módulos, lógica, utilities)
  - `/assets` - Imágenes, iconos, animaciones

- **`/config`** - Configuración del proyecto
  - `firebase-config.js` - Configuración de Firebase
  - `manifest.json` - PWA manifest
  - `.env.example` - Variables de entorno

- **`/public`** - Archivos estáticos
  - `index.html` - Punto de entrada
  - `service-worker.js` - Service Worker
  - `/icons` - Iconos para PWA

- **`/tests`** - Pruebas automatizadas

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/TOMMYJAQUEZ/radiologiaconfeapp.git
cd radiologiaconfeapp

# 2. Instalar dependencias (si aplica)
npm install

# 3. Configurar Firebase
# - Copiar .env.example a .env
# - Añadir credenciales de Firebase

# 4. Ejecutar servidor local
npm start

# 5. Abrir en navegador
http://localhost:3000
```

## 📚 Documentación

- **[PRD Completo](./docs/PRD.md)** - Especificación oficial del proyecto
- **[Sistema de Diseño](./docs/DESIGN_SYSTEM.md)** - Colores, tipografías, componentes
- **[Arquitectura](./docs/ARCHITECTURE.md)** - Estructura técnica y flujos
- **[Roadmap](./docs/PRD.md#roadmap)** - Versiones planeadas

## 🎯 Características Principales

✅ **Autenticación** - Login con Google y correo (Firebase Auth)  
✅ **Anatomía Interactiva** - Visualización de sistemas óseo, muscular, etc.  
✅ **Sistema de Quiz** - Modo Estudio (sin presión) y Modo Examen (con tiempo)  
✅ **Gamificación** - XP, niveles, logros, badges  
✅ **Dashboard Estudiante** - Progreso, estadísticas, racha actual  
✅ **Panel Administrador** - Gestión de estudiantes, banco de preguntas, acceso por fechas  
✅ **PWA** - Instalación como app, funcionamiento offline  
✅ **Responsive** - Optimizado para mobile, tablet, desktop  
✅ **Accesibilidad** - WCAG 2.1 AA compliant  

## 🏗️ Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript ES2024
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **PWA:** Service Workers, Web App Manifest
- **Diseño:** Design System personalizado, animaciones CSS
- **Responsive:** Mobile-first, breakpoints adaptables

## 👥 Roles

- **Administrador** - Gestión completa, panel de control, reportes
- **Estudiante** - Acceso a quizzes, anatomía, seguimiento de progreso

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Navegadores móviles modernos

## 📞 Contacto

**Desarrollado con Fe y Ciencia**

---

**Versión:** 0.1.0  
**Estado:** En desarrollo  
**Última actualización:** 2026-07-02
