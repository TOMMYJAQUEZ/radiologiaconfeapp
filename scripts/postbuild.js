const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const standaloneDir = path.join(projectRoot, '.next', 'standalone');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(standaloneDir)) {
  console.log('📦 Copiando recursos estáticos al bundle standalone...');
  
  // Copiar .next/static a .next/standalone/.next/static
  const staticSrc = path.join(projectRoot, '.next', 'static');
  const staticDest = path.join(standaloneDir, '.next', 'static');
  copyDirSync(staticSrc, staticDest);

  // Copiar public a .next/standalone/public
  const publicSrc = path.join(projectRoot, 'public');
  const publicDest = path.join(standaloneDir, 'public');
  if (fs.existsSync(publicSrc)) {
    copyDirSync(publicSrc, publicDest);
  }

  console.log('✅ Bundle standalone listo para producción en Hostinger.');
}
