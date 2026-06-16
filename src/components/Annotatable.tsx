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

export function Annotatable({ children, mdxFile, onAddAnnotation }: AnnotatableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rect, text } = useTextSelection(containerRef);
  const [activeContext, setActiveContext] = useState<AnnotationContext | null>(null);
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null);

  function handleAddComment() {
    const sel = window.getSelection();
    if (!sel || !text) return;
    setActiveRect(rect);
    setActiveContext(captureContext(sel, mdxFile));
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
            setActiveContext(null);
            setActiveRect(null);
            window.getSelection()?.removeAllRanges();
          }}
          onCancel={() => {
            setActiveContext(null);
            setActiveRect(null);
          }}
        />
      )}
    </div>
  );
}
