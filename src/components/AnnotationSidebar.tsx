import type { Annotation } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AnnotationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotations: Annotation[];
  onSend: (a: Annotation) => void;
  onDiscard: (id: string) => void;
  sendingId: string | null;
}

export function AnnotationSidebar({
  open,
  onOpenChange,
  annotations,
  onSend,
  onDiscard,
  sendingId,
}: AnnotationSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-96 flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-sm font-medium">Feedback Queue</SheetTitle>
          <SheetDescription className="sr-only">
            Review, send, or discard queued annotations.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {annotations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select text in the document to add a comment.
            </p>
          )}
          {annotations.map((a) => (
            <div key={a.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {a.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {a.context.blockType}
                  {a.context.lineNumber ? ` · line ${a.context.lineNumber}` : ''}
                </span>
              </div>
              <blockquote className="line-clamp-2 border-l-2 border-neutral-200 pl-2 text-sm italic text-muted-foreground">
                "{a.context.quote}"
              </blockquote>
              <p className="text-sm">{a.comment}</p>
              {a.status === 'queued' ? (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" disabled={sendingId === a.id} onClick={() => onSend(a)}>
                    {sendingId === a.id ? 'Sending…' : 'Send to Linear'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDiscard(a.id)}>
                    Discard
                  </Button>
                </div>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  ✓ Sent
                </Badge>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
