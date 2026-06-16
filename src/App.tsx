import { useCallback, useEffect, useState } from 'react';
import type { Annotation } from '@/types';
import { useAnnotations } from '@/hooks/useAnnotations';
import { MDXRenderer } from '@/components/MDXRenderer';
import { Annotatable } from '@/components/Annotatable';
import { AnnotationSidebar } from '@/components/AnnotationSidebar';
import { FilePicker, useCurrentFile, type FileOption } from '@/components/FilePicker';
import { Badge } from '@/components/ui/badge';

const FALLBACK_FILES: FileOption[] = [{ label: 'example.mdx', value: 'example.mdx' }];

export function App() {
  const initialFile = useCurrentFile();
  const [file, setFile] = useState(initialFile);
  const [files, setFiles] = useState<FileOption[]>(FALLBACK_FILES);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { annotations, addAnnotation, markSent, discard } = useAnnotations();
  const queued = annotations.filter((a) => a.status === 'queued').length;

  // Load the file manifest (best-effort; falls back to a single entry).
  useEffect(() => {
    fetch('/content/manifest.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no manifest'))))
      .then((list: FileOption[]) => Array.isArray(list) && list.length && setFiles(list))
      .catch(() => {});
  }, []);

  // Keep `file` in sync with browser back/forward navigation.
  useEffect(() => {
    function onPop() {
      setFile(new URLSearchParams(window.location.search).get('file') ?? 'example.mdx');
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Surface the queue automatically the first time a comment is added.
  useEffect(() => {
    if (annotations.length === 1) setSheetOpen(true);
  }, [annotations.length]);

  const changeFile = useCallback((next: string) => {
    setFile(next);
    const url = new URL(window.location.href);
    url.searchParams.set('file', next);
    window.history.pushState({}, '', url);
  }, []);

  const handleSend = useCallback(
    async (a: Annotation) => {
      setSendingId(a.id);
      try {
        const res = await fetch('/api/send-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(a),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        markSent(a.id);
      } catch (err) {
        window.alert('Failed to send: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setSendingId(null);
      }
    },
    [markSent],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur">
        <FilePicker value={file} files={files} onChange={changeFile} />
        <span className="text-xs text-muted-foreground">MDX Annotator</span>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <MDXRenderer
          file={file}
          renderAnnotatable={(content) => (
            <Annotatable mdxFile={file} onAddAnnotation={addAnnotation}>
              {content}
            </Annotatable>
          )}
        />
      </main>

      {queued > 0 && (
        <button onClick={() => setSheetOpen(true)} className="fixed bottom-6 right-6 z-40">
          <Badge className="cursor-pointer px-3 py-1.5 text-sm shadow-md">
            {queued} {queued === 1 ? 'comment' : 'comments'} queued
          </Badge>
        </button>
      )}

      <AnnotationSidebar
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        annotations={annotations}
        onSend={handleSend}
        onDiscard={discard}
        sendingId={sendingId}
      />
    </div>
  );
}
