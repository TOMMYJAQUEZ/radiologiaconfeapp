/**
 * build-hostinger.js
 * Empaquetador de producción para Hostinger Node.js App Manager.
 * Genera la carpeta "radiologia-con-fe-deploy" lista para subir.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n====================================================');
console.log('📦  RADIOLOGÍA CON FE — BUILD PARA HOSTINGER');
console.log('====================================================\n');

const projectRoot = path.resolve(__dirname, '..');    // radiologia-con-fe/
const workspaceRoot = path.resolve(projectRoot, '..'); // raíz del workspace

// Carpeta de salida: una sola, bien nombrada
const deployDir = path.join(workspaceRoot, 'radiologia-con-fe-deploy');

// ── Helpers ───────────────────────────────────────────────────────────────────
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(s, d) : fs.copyFileSync(s, d);
  }
}

function rmDirSafe(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// ── 1. Compilar Next.js Standalone ───────────────────────────────────────────
console.log('1️⃣  Compilando Next.js en modo Standalone...\n');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  console.log('\n✅ Compilación exitosa.\n');
} catch (err) {
  console.error('❌ Error al compilar Next.js:', err.message);
  process.exit(1);
}

// ── 2. Preparar carpeta de deploy limpia ─────────────────────────────────────
console.log('2️⃣  Preparando carpeta de deploy...');
rmDirSafe(deployDir);
fs.mkdirSync(deployDir, { recursive: true });

// Copiar el bundle standalone generado por Next.js
const standalonePath = path.join(projectRoot, '.next', 'standalone');
if (fs.existsSync(standalonePath)) {
  copyDirSync(standalonePath, deployDir);
  console.log('   ✔ Bundle standalone copiado.');
} else {
  console.error('❌ No se encontró el bundle standalone en .next/standalone');
  process.exit(1);
}

// Copiar .next/static → deployDir/.next/static  (archivos JS/CSS optimizados)
copyDirSync(
  path.join(projectRoot, '.next', 'static'),
  path.join(deployDir, '.next', 'static')
);
console.log('   ✔ Archivos estáticos de Next.js copiados.');

// Copiar carpeta public/ (logo, favicon, imágenes)
copyDirSync(
  path.join(projectRoot, 'public'),
  path.join(deployDir, 'public')
);
console.log('   ✔ Carpeta public/ copiada.');

// ── 3. package.json optimizado para Hostinger ────────────────────────────────
// Hostinger corre "npm run build" y luego "npm start".
// La app ya está compilada → build es no-op, start arranca server.js.
const hostingerPkg = {
  name: 'radiologia-con-fe',
  version: '1.0.0',
  private: true,
  scripts: {
    build: 'echo "Already built — standalone bundle ready"',
    start: 'node server.js',
  },
};
fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(hostingerPkg, null, 2),
  'utf8'
);
console.log('   ✔ package.json para Hostinger generado.');

// ── 4. Variables de entorno ───────────────────────────────────────────────────
const envSrc = path.join(projectRoot, '.env.local');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, path.join(deployDir, '.env'));
  console.log('   ✔ Variables de entorno copiadas (.env).');
}

// .env.example para referencia
const envExample = `# Variables de entorno — Radiología con Fe
NODE_ENV=production
PORT=3000

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_publica
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_secreta

NEXT_PUBLIC_APP_URL=https://tudominio.com
NEXT_PUBLIC_APP_NAME=Radiologia con Fe Academy
`;
fs.writeFileSync(path.join(deployDir, '.env.example'), envExample, 'utf8');

// ── 5. .htaccess (Apache reverse-proxy para Hostinger shared+Node) ────────────
const htaccess = `Options -Indexes +FollowSymLinks

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Archivos estáticos de Next.js
  RewriteRule ^_next/static/(.*)$ .next/static/$1 [L]
  RewriteRule ^_next/(.*)$        .next/$1         [L]

  # Archivos de /public
  RewriteCond %{DOCUMENT_ROOT}/public/$1 -f
  RewriteRule ^(.*)$              public/$1        [L]

  # Todo lo demás → servidor Node.js
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:%{ENV:PORT}/$1 [P,L]
</IfModule>
`;
fs.writeFileSync(path.join(deployDir, '.htaccess'), htaccess, 'utf8');
console.log('   ✔ .htaccess generado.');

// ── 6. Crear ZIP listo para subir ────────────────────────────────────────────
console.log('\n3️⃣  Comprimiendo paquete ZIP para Hostinger...');
const zipPath = path.join(workspaceRoot, 'radiologia-con-fe-deploy.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

try {
  // PowerShell Compress-Archive (nativo en Windows)
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${deployDir}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' }
  );
  const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
  console.log(`✅ ZIP generado: radiologia-con-fe-deploy.zip (${sizeMB} MB)\n`);
} catch (e) {
  console.log('⚠️  No se pudo crear el ZIP automáticamente:', e.message);
  console.log('   Comprime manualmente la carpeta radiologia-con-fe-deploy/\n');
}

// ── Resumen final ─────────────────────────────────────────────────────────────
console.log('====================================================');
console.log('🎉  LISTO PARA HOSTINGER');
console.log('----------------------------------------------------');
console.log(`📁  Carpeta: radiologia-con-fe-deploy/`);
console.log(`📦  ZIP:     radiologia-con-fe-deploy.zip`);
console.log('');
console.log('📋  INSTRUCCIONES HOSTINGER:');
console.log('   1. Sube radiologia-con-fe-deploy.zip a Hostinger');
console.log('   2. Extrae el ZIP en la raíz de tu Node.js App');
console.log('   3. Comando de compilación: npm run build');
console.log('   4. Comando de inicio:      node server.js');
console.log('   5. Establece las variables de entorno en Hostinger Panel');
console.log('====================================================\n');
