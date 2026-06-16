import type { Annotation } from '@/types';

export function formatSubject(a: Annotation): string {
  const quote = a.context.quote;
  const truncated = quote.slice(0, 50).replace(/\n/g, ' ');
  const ellipsis = quote.length > 50 ? '…' : '';
  return `[MDX Review / ${a.severity}] ${a.context.mdxFile} — "${truncated}${ellipsis}"`;
}

export function formatEmailHtml(a: Annotation): string {
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
