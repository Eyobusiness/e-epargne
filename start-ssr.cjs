/**
 * Lanceur PM2 fiable — force l'écoute HTTP même si isMainModule() échoue sous PM2.
 *
 * Usage :
 *   pm2 start start-ssr.cjs --name tontine-app
 */
const path = require('path');
const { spawn } = require('child_process');

process.env.PORT = process.env.PORT || '3200';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.RUN_SSR_SERVER = '1';

const serverPath = path.join(__dirname, 'dist/e-tontine/server/server.mjs');

console.log(`[start-ssr] starting ${serverPath}`);
console.log(
  `[start-ssr] PORT=${process.env.PORT} HOST=${process.env.HOST} NODE_ENV=${process.env.NODE_ENV}`,
);

const child = spawn(process.execPath, [serverPath], {
  cwd: __dirname,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  console.error(`[start-ssr] child exited code=${code} signal=${signal}`);
  process.exit(code ?? 1);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
