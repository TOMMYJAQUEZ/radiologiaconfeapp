const path = require('path');
const fs = require('fs');

// Forzar HOSTNAME a 0.0.0.0 para evitar errores de enlace (EADDRNOTAVAIL) en servidores proxy como LiteSpeed/Hostinger
process.env.HOSTNAME = '0.0.0.0';

const port = process.env.PORT || '3000';
process.env.PORT = port;

console.log(`🚀 Iniciando Radiología con Fe en el puerto ${port}...`);

const standaloneServer = path.join(__dirname, '..', '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('✅ Cargando servidor Standalone optimizado...');
  require(standaloneServer);
} else {
  console.log('ℹ️ Cargando via next start estándar...');
  const { spawn } = require('child_process');
  const nextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
  const child = spawn(nextBin, ['start', '-H', '0.0.0.0', '-p', port], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
