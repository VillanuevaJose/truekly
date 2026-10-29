import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'

function debugLogPlugin(): Plugin {
  return {
    name: 'debug-log-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/debug-log' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            const line = `[${new Date().toISOString()}] ${body}\n`;
            try {
              fs.appendFileSync(path.resolve(process.cwd(), 'debug_breadcrumbs.log'), line);
            } catch {}
            console.log(`[BREADCRUMB] ${body}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }
        next();
      });
    },
  };
}

function dniApiPlugin(): Plugin {
  return {
    name: 'dni-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/dni')) {
          return next();
        }

        try {
          // Asegurar que process.env.DECOLECTA_API_TOKEN esté fresco desde .env
          if (!process.env.DECOLECTA_API_TOKEN) {
            const freshEnv = loadEnv(server.config.mode || 'development', process.cwd(), '');
            if (freshEnv.DECOLECTA_API_TOKEN) {
              process.env.DECOLECTA_API_TOKEN = freshEnv.DECOLECTA_API_TOKEN;
            }
          }

          const handlerModule = await server.ssrLoadModule(path.resolve(process.cwd(), 'api/dni.ts'));
          const handler = handlerModule.default;
          await handler(req, res);
        } catch {
          console.error('[API /api/dni Error en dev]');
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ code: 'error_proveedor', error: 'Error en el middleware dev al procesar /api/dni' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno locales (incluyendo DECOLECTA_API_TOKEN sin prefijo VITE_)
  const env = loadEnv(mode, process.cwd(), '');
  if (env.DECOLECTA_API_TOKEN) {
    process.env.DECOLECTA_API_TOKEN = env.DECOLECTA_API_TOKEN;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      dniApiPlugin(),
      debugLogPlugin(),
    ],
  };
});
