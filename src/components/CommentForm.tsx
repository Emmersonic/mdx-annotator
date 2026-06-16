import { useState } from 'react';
import type { AnnotationContext, Severity } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CommentFormProps {
  rect: DOMRect;
  context: AnnotationContext;
  onSubmit: (comment: string, severity: Severity) => void;
  onCancel: () => void;
}

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
        <Tabs value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
          <TabsList className="w-full">
            <TabsTrigger value="bug" className="flex-1">Bug</TabsTrigger>
            <TabsTrigger value="suggestion" className="flex-1">Suggestion</TabsTrigger>
            <TabsTrigger value="question" className="flex-1">Question</TabsTrigger>
          </TabsList>
        </Tabs>
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
