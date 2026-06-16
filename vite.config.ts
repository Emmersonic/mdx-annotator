import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Dev-only handler for POST /api/send-comment so `npm run dev` completes the
 * full queue→send→Sent loop without running `vercel dev` in a second terminal.
 * In production the equivalent lives in api/send-comment.ts (Vercel function).
 * If RESEND_API_KEY + LINEAR_INTAKE_EMAIL are set in .env.local it sends a real
 * email; otherwise it simulates success and logs the subject.
 */
function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-send-comment-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/send-comment', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) body += chunk;

        let annotation: unknown;
        try {
          annotation = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        try {
          // Compile + load the shared serializer through Vite (handles TS).
          const { formatSubject, formatEmailHtml } = await server.ssrLoadModule(
            '/src/lib/formatEmail.ts',
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subject = formatSubject(annotation as any);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const html = formatEmailHtml(annotation as any);

          const apiKey = env.RESEND_API_KEY;
          const to = env.LINEAR_INTAKE_EMAIL;
          const from = env.RESEND_FROM ?? 'reviews@yourdomain.com';

          if (!apiKey || !to) {
            server.config.logger.info(`\n[send-comment] simulated → ${subject}`);
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, simulated: true }));
            return;
          }

          const { Resend } = await server.ssrLoadModule('resend');
          const resend = new Resend(apiKey);
          await resend.emails.send({ from, to, subject, html });
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          server.config.logger.error(`[send-comment] ${message}`);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // GitHub Pages serves under /<repo>/; the deploy workflow sets VITE_BASE.
    // Local dev and Vercel stay at root.
    base: process.env.VITE_BASE || '/',
    plugins: [react(), devApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
