import { useState } from 'react';
import type { AnnotationContext, Severity } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CommentFormProps {
  rect: DOMRect;
  context: AnnotationContext;
  onSubmit: (comment: string, severity: Severity) => void;
  onCancel: () => void;
}

export function CommentForm({ rect, context, onSubmit, onCancel }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [severity, setSeverity] = useState<Severity>('suggestion');

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    left: Math.min(Math.max(8, rect.left), window.innerWidth - 296),
  };

  return (
    <div style={style} className="z-50 w-72">
      <div className="rounded-lg border bg-popover p-3 shadow-md space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-1">"{context.quote}"</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Leave a comment…"
          autoFocus
          className="text-sm"
        />
        <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">bug</SelectItem>
            <SelectItem value="suggestion">suggestion</SelectItem>
            <SelectItem value="question">question</SelectItem>
          </SelectContent>
        </Select>
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
