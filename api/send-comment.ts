import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { formatSubject, formatEmailHtml } from '../src/lib/formatEmail';
import type { Annotation } from '../src/types';

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.LINEAR_INTAKE_EMAIL;
const from = process.env.RESEND_FROM ?? 'reviews@yourdomain.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const annotation = req.body as Annotation;
  if (!annotation?.context?.quote || !annotation.comment) {
    return res.status(400).json({ error: 'Malformed annotation' });
  }

  const subject = formatSubject(annotation);
  const html = formatEmailHtml(annotation);

  // No credentials configured → simulate so previews/demos still complete the flow.
  if (!apiKey || !to) {
    console.log(`[send-comment] simulated (no RESEND_API_KEY/LINEAR_INTAKE_EMAIL) → ${subject}`);
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
