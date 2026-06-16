import { useState } from 'react';
import type { AnnotationContext, Severity } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  rect: DOMRect;
  context: AnnotationContext;
  onSubmit: (comment: string, severity: Severity) => void;
  onCancel: () => void;
}

const SEVERITIES: Severity[] = ['bug', 'suggestion', 'question'];

export function CommentForm({ rect, context: _context, onSubmit, onCancel }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [severity, setSeverity] = useState<Severity>('suggestion');

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    left: Math.min(Math.max(8, rect.left), window.innerWidth - 392),
  };

  return (
    <div style={style} className="z-50 w-96">
      <div className="rounded-lg border bg-popover p-3 shadow-md space-y-2">
        <div className="flex rounded-md border overflow-hidden text-xs font-medium">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSeverity(s)}
              className={cn(
                'flex-1 py-1.5 capitalize transition-colors',
                severity === s
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Leave a comment…"
          autoFocus
          className="text-sm w-full"
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!comment.trim()}
            onClick={() => onSubmit(comment.trim(), severity)}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
