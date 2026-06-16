# MDX Annotator

A lightweight React app for reviewing `.mdx` files with text highlighting, inline
commenting, and per-annotation feedback routed to Linear via email intake.

- Render `.mdx` at runtime, including syntax-highlighted code
- Select any text → leave a comment with a severity
- Each comment captures structured context (quote, surrounding text, block type, element
  path, file) sufficient for AI-assisted resolution
- Send each annotation as its own email → one Linear issue

## Stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Bundler        | Vite + React 18 + TypeScript                      |
| MDX rendering  | `@mdx-js/mdx` `evaluate` (runtime, in-browser)    |
| Code highlight | `rehype-pretty-code` + `shiki` (`github-dark`)    |
| Text selection | Native `selectionchange` + Range API (no library) |
| Styling        | Tailwind CSS + `@tailwindcss/typography`          |
| UI components  | shadcn/ui (Select, Textarea, Button, Badge, Sheet) |
| Email          | Resend                                            |
| API            | Vercel function (`api/send-comment.ts`)           |
| Issue intake   | Linear native email-to-issue                      |

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173/?file=example.mdx
```

`npm run dev` is **self-contained**: a small Vite dev middleware serves
`POST /api/send-comment`. With no credentials it simulates a successful send so the full
queue → send → ✓ Sent loop works out of the box. Add credentials in `.env.local` to send
real mail.

### Try it

1. Select any text in the document — a **+ comment** pill appears above the selection.
2. Click it, type a note, pick a severity, **Add** to queue.
3. A badge appears bottom-right. Open it to review the queue.
4. **Send to Linear** on any item → one email → one issue.
5. Switch documents with the top-left picker (`?file=` stays shareable).

## Configuration

Copy `.env.example` → `.env.local`:

```env
RESEND_API_KEY=re_...              # https://resend.com/api-keys
LINEAR_INTAKE_EMAIL=team-xyz@linear.app  # Linear → Settings → Teams → Integrations → Email
RESEND_FROM=reviews@yourdomain.com # a verified Resend sender
```

No `VITE_`-prefixed vars — all secrets stay server-side.

## Adding documents

Drop `.mdx` files in `public/content/` and add an entry to
`public/content/manifest.json`. Constraint: files must **not** use `import` statements
(there is no module resolver in the browser); map any components via the `components`
prop in `MDXRenderer` instead.

## Build & deploy

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # serve the production build locally
```

### Vercel (full app, real email)

The SPA builds to `dist/`, and `api/send-comment.ts` runs as a serverless function. Set
`RESEND_API_KEY`, `LINEAR_INTAKE_EMAIL`, and `RESEND_FROM` in the Vercel project's
environment variables.

### GitHub Pages (static demo, auto-deploy)

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to
`main` → **https://emmersonic.github.io/mdx-annotator/**. Pages is static-only, so there
is no `/api` function; the build sets `VITE_DEMO_MODE=true` and the send is **simulated**
client-side (the header shows "demo (send simulated)"). The base path is handled via
`VITE_BASE=/mdx-annotator/`. For real email, use the Vercel deploy above.

## Project layout

```
api/send-comment.ts        Vercel function: Resend → Linear intake
public/content/*.mdx       Documents served statically
src/
  components/
    MDXRenderer.tsx         fetch → evaluate → render
    CodeBlock.tsx           <pre> tagged for context capture
    FilePicker.tsx          ?file= picker
    Annotatable.tsx         hosts selection hook + popover + form
    SelectionPopover.tsx    floating "+ comment" pill
    CommentForm.tsx         comment + severity, queues an Annotation
    AnnotationSidebar.tsx   Sheet queue with Send / Discard
    ui/                     shadcn primitives
  hooks/
    useTextSelection.ts     native selection geometry + text
    useAnnotations.ts       local queue state
  lib/
    captureContext.ts       Range API → AnnotationContext
    formatEmail.ts          Annotation → subject + HTML body
  types.ts  App.tsx  main.tsx
```

## Out of scope (v1)

Persistent highlights, auth, real-time collaboration, code line-click comments. See the
plan's "Nice-to-Haves" for post-v1 directions.
