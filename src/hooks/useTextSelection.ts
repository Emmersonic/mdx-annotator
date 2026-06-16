import { type RefObject, useEffect, useState } from 'react';

export interface TextSelection {
  rect: DOMRect | null;
  text: string;
}

export function useTextSelection(containerRef: RefObject<Element | null>): TextSelection {
  const [selection, setSelection] = useState<TextSelection>({ rect: null, text: '' });

  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
        setSelection({ rect: null, text: '' });
        return;
      }

      const range = sel.getRangeAt(0);
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        setSelection({ rect: null, text: '' });
        return;
      }

      setSelection({
        rect: range.getBoundingClientRect(),
        text: sel.toString().trim(),
      });
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef]);

  return selection;
}
