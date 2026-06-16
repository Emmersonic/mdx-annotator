import { useCallback, useState } from 'react';
import type { Annotation } from '@/types';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const addAnnotation = useCallback(
    (partial: Omit<Annotation, 'id' | 'createdAt' | 'status'>): void => {
      setAnnotations((prev) => [
        ...prev,
        {
          ...partial,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'queued',
        },
      ]);
    },
    [],
  );

  const markSent = useCallback((id: string): void => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'sent' } : a)),
    );
  }, []);

  const discard = useCallback((id: string): void => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { annotations, addAnnotation, markSent, discard };
}
