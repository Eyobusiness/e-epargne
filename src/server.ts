import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const browserDistFolder = join(__dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * PM2 change process.argv → isMainModule() peut renvoyer false.
 * On écoute donc dès qu'on n'est pas explicitement en mode CLI Angular.
 */
function shouldListen(): boolean {
  if (process.env['SKIP_SSR_LISTEN'] === '1') {
    return false;
  }
  // Toujours en prod / PM2 / forçage explicite
  if (
    process.env['RUN_SSR_SERVER'] === '1' ||
    process.env['NODE_ENV'] === 'production' ||
    process.env['PM2_HOME'] ||
    process.env['pm_id'] != null
  ) {
    return true;
  }
  try {
    return isMainModule(import.meta.url);
  } catch {
    return true;
  }
}

if (shouldListen()) {
  const port = Number(process.env['PORT'] || 3200);
  const host = process.env['HOST'] || '0.0.0.0';
  app.listen(port, host, () => {
    console.log(
      `Node Express server listening on http://${host}:${port} (pid=${process.pid})`,
    );
  });
} else {
  console.log('SSR module loaded without listen (Angular CLI / SKIP_SSR_LISTEN)');
}

export const reqHandler = createNodeRequestHandler(app);
