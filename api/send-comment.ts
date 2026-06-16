import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Types inlined to avoid @/ path alias issues in Node ESM resolution.
interface AnnotationContext {
  quote: string;
  prefix: string;
  suffix: string;
  blockType: string;
  lineNumber?: number;
  elementPath: string;
  mdxFile: string;
}

interface Annotation {
  id: string;
  context: AnnotationContext;
  comment: string;
  severity: 'bug' | 'suggestion' | 'question';
  createdAt: string;
  status: 'queued' | 'sent';
}

interface RequestBody {
  annotation?: Annotation;
  _config?: {
    resendApiKey?: string;
    linearIntakeEmail?: string;
    resendFrom?: string;
  };
}

function formatSubject(a: Annotation): string {
  const quote = a.context.quote;
  const truncated = quote.slice(0, 50).replace(/\n/g, ' ');
  const ellipsis = quote.length > 50 ? '…' : '';
  return `[MDX Review / ${a.severity}] ${a.context.mdxFile} — "${truncated}${ellipsis}"`;
}

function formatEmailHtml(a: Annotation): string {
  const { context: ctx } = a;
  const lineInfo = ctx.lineNumber ? ` · Line ${ctx.lineNumber}` : '';
  return `<h2>MDX Review Feedback</h2>
<table>
  <tr><td><strong>File</strong></td><td><code>${ctx.mdxFile}</code></td></tr>
  <tr><td><strong>Block</strong></td><td>${ctx.blockType}${lineInfo}</td></tr>
  <tr><td><strong>Severity</strong></td><td>${a.severity}</td></tr>
  <tr><td><strong>Element</strong></td><td><code>${ctx.elementPath}</code></td></tr>
</table>
<h3>Highlighted text</h3>
<blockquote>
  ${ctx.prefix}<strong>${ctx.quote}</strong>${ctx.suffix}
</blockquote>
<h3>Reviewer comment</h3>
<p>${a.comment}</p>
<hr/>
<p><small>Submitted: ${a.createdAt}</small></p>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body as RequestBody;
  const annotation: Annotation | undefined = body.annotation ?? (body as unknown as Annotation);

  if (!annotation?.context?.quote || !annotation.comment) {
    return res.status(400).json({ error: 'Malformed annotation' });
  }

  const apiKey = process.env.RESEND_API_KEY ?? body._config?.resendApiKey ?? '';
  const to = process.env.LINEAR_INTAKE_EMAIL ?? body._config?.linearIntakeEmail ?? '';
  const from = process.env.RESEND_FROM ?? body._config?.resendFrom ?? 'reviews@example.com';

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
