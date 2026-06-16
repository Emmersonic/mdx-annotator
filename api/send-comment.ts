import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { formatSubject, formatEmailHtml } from '../src/lib/formatEmail';
import type { Annotation } from '../src/types';

interface RequestBody {
  annotation: Annotation;
  _config?: {
    resendApiKey?: string;
    linearIntakeEmail?: string;
    resendFrom?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body as RequestBody;

  // Accept annotation at top level (legacy) or nested under body.annotation.
  const annotation: Annotation = body.annotation ?? (body as unknown as Annotation);
  if (!annotation?.context?.quote || !annotation.comment) {
    return res.status(400).json({ error: 'Malformed annotation' });
  }

  // Env vars take priority; client-supplied config is the fallback for local use.
  const apiKey = process.env.RESEND_API_KEY ?? body._config?.resendApiKey ?? '';
  const to = process.env.LINEAR_INTAKE_EMAIL ?? body._config?.linearIntakeEmail ?? '';
  const from =
    process.env.RESEND_FROM ?? body._config?.resendFrom ?? 'reviews@example.com';

  const subject = formatSubject(annotation);
  const html = formatEmailHtml(annotation);

  if (!apiKey || !to) {
    console.log(`[send-comment] simulated (no credentials) → ${subject}`);
    return res.status(200).json({ ok: true, simulated: true });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, html });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-comment]', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to send' });
  }
}
