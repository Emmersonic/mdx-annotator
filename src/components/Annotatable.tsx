import { useRef, useState } from 'react';
import type { Annotation, AnnotationContext } from '@/types';
import { useTextSelection } from '@/hooks/useTextSelection';
import { captureContext } from '@/lib/captureContext';
import { SelectionPopover } from './SelectionPopover';
import { CommentForm } from './CommentForm';

interface AnnotatableProps {
  children: React.ReactNode;
  mdxFile: string;
  onAddAnnotation: (partial: Omit<Annotation, 'id' | 'createdAt' | 'status'>) => void;
}

function applyDraftHighlight(range: Range) {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  const h = new (window as any).Highlight(range);
  (CSS as any).highlights.set('comment-draft', h);
}

function clearDraftHighlight() {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  (CSS as any).highlights.delete('comment-draft');
}

export function Annotatable({ children, mdxFile, onAddAnnotation }: AnnotatableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rect, text } = useTextSelection(containerRef);
  const [activeContext, setActiveContext] = useState<AnnotationContext | null>(null);
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null);

  function handleAddComment() {
    const sel = window.getSelection();
    if (!sel || !text) return;
    const range = sel.getRangeAt(0).cloneRange();
    const ctx = captureContext(sel, mdxFile);
    applyDraftHighlight(range);
    setActiveRect(rect);
    setActiveContext(ctx);
  }

  function handleCancel() {
    clearDraftHighlight();
    setActiveContext(null);
    setActiveRect(null);
  }

  return (
    <div ref={containerRef} className="relative">
      {children}
      {rect && text && !activeContext && (
        <SelectionPopover rect={rect} onAddComment={handleAddComment} />
      )}
      {activeContext && activeRect && (
        <CommentForm
          rect={activeRect}
          context={activeContext}
          onSubmit={(comment, severity) => {
            onAddAnnotation({ context: activeContext, comment, severity });
            clearDraftHighlight();
            setActiveContext(null);
            setActiveRect(null);
            window.getSelection()?.removeAllRanges();
          }}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
