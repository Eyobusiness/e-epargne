/**
 * PM2 — backoffice Angular SSR.
 *
 * Sur le serveur (/opt/tontine) :
 *   pm2 delete tontine-app
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 save
 *   curl -I http://127.0.0.1:3200
 */
const path = require('path');
const fs = require('fs');

const root = __dirname;
const launcher = path.join(root, 'start-ssr.cjs');
const serverScript = path.join(root, 'dist/e-tontine/server/server.mjs');

if (!fs.existsSync(serverScript)) {
  console.error(`[ecosystem] Fichier introuvable: ${serverScript}`);
}

module.exports = {
  apps: [
    {
      name: 'tontine-app',
      cwd: root,
      // Lanceur dédié : contourne isMainModule() qui échoue sous PM2
      script: fs.existsSync(launcher) ? launcher : serverScript,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      time: true,
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3200,
        HOST: '0.0.0.0',
        RUN_SSR_SERVER: '1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3200,
        HOST: '0.0.0.0',
        RUN_SSR_SERVER: '1',
      },
    },
  ],
};
