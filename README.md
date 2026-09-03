# 🏥 Radiología con Fe — Plataforma Educativa Médica

Plataforma educativa moderna e interactiva para el aprendizaje y certificación en radiología e imagenología médica.

---

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router) + React 18
- **Base de Datos y Autenticación**: Supabase (PostgreSQL, Row Level Security, Auth SSR)
- **Estilos**: Tailwind CSS + Lucide Icons + Chart.js
- **Generación de Reportes y Certificados**: jsPDF, jsPDF-AutoTable, QRCode
- **Despliegue de Producción**: Hostinger Business Web Hosting (Node.js 20.x + LiteSpeed Proxy)

---

## 🛠️ Configuración Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TOMMYJAQUEZ/radiologiaconfeapp.git
   cd radiologiaconfeapp
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en `.env.local` (ver `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 🌐 Despliegue en Hostinger Business Web Hosting

Este proyecto está optimizado para funcionar directamente en el administrador de aplicaciones **Node.js** de Hostinger.

### Configuración en hPanel de Hostinger:

1. **Gestor de Git (Avanzado > Git)**:
   - **Repositorio**: `https://github.com/TOMMYJAQUEZ/radiologiaconfeapp.git`
   - **Rama**: `main`
   - **Directorio de instalación**: `public_html`

2. **Aplicación Node.js (Avanzado > Node.js)**:
   - **Versión de Node.js**: `20.x`
   - **Ruta de la aplicación (Application root)**: `public_html`
   - **Archivo de inicio (Startup file)**: `server.js` *(incluido en la raíz)*
   - **Modo de aplicación**: `Production`
   - **Variables de entorno**:
     - `PORT`: `3000`
     - `NODE_ENV`: `production`
     - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu Anon Key pública
     - `SUPABASE_SERVICE_ROLE_KEY`: Tu Service Role Key secreta
     - `NEXT_PUBLIC_APP_URL`: Tu dominio (ej. `https://tudominio.com`)

3. **Compilación en Hostinger (SSH / Web Terminal)**:
   ```bash
   npm install
   npm run build
   ```

4. Haz clic en **Iniciar Aplicación** (o Reiniciar) en el panel de Node.js.
