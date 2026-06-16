import type { AnnotationContext, BlockType } from '@/types';

const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, pre, blockquote';

/** Return the nearest Element for a node (the node itself if it is an Element, else its parent). */
function nearestElement(node: Node): Element | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return node as Element;
  }
  return node.parentElement;
}

/** Walk text nodes in blockEl to find the character offset of `node` at `offsetInNode`. */
function textOffsetInBlock(blockEl: Element, node: Node, offsetInNode: number): number {
  let offset = 0;
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) return offset + offsetInNode;
    offset += (current as Text).length;
    current = walker.nextNode();
  }
  return offset;
}

/** Build a short CSS-like selector path from el up to article/main. */
function elementPath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  const stop = el.closest('article, main') ?? document.body;
  while (current && current !== stop) {
    const node: Element = current;
    const tag = node.tagName.toLowerCase();
    const siblings = Array.from(node.parentElement?.children ?? []).filter(
      (c) => c.tagName === node.tagName,
    );
    const idx = siblings.indexOf(node);
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${idx + 1})` : tag);
    current = node.parentElement;
  }
  return parts.join(' > ');
}

function detectBlockType(el: Element): BlockType {
  const tag = el.tagName.toLowerCase();
  if (tag === 'pre' || el.closest('[data-code-block]')) return 'codeBlock';
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'li') return 'listItem';
  if (tag === 'p') return 'paragraph';
  return 'other';
}

export function captureContext(selection: Selection, mdxFile: string): AnnotationContext {
  const range = selection.getRangeAt(0);
  const quote = selection.toString().trim();

  const anchorEl = nearestElement(range.commonAncestorContainer);
  const blockEl = anchorEl?.closest(BLOCK_SELECTOR) ?? null;

  if (!blockEl) {
    return { quote, prefix: '', suffix: '', blockType: 'other', elementPath: '', mdxFile };
  }

  const blockText = blockEl.textContent ?? '';
  const startOffset = textOffsetInBlock(blockEl, range.startContainer, range.startOffset);
  const prefix = blockText.slice(Math.max(0, startOffset - 60), startOffset);
  const suffix = blockText.slice(startOffset + quote.length, startOffset + quote.length + 60);

  let lineNumber: number | undefined;
  const lineEl = nearestElement(range.startContainer)?.closest('[data-line]');
  if (lineEl) {
    const parsed = parseInt(lineEl.getAttribute('data-line') ?? '', 10);
    lineNumber = parsed || undefined;
  }

  return {
    quote,
    prefix,
    suffix,
    blockType: detectBlockType(blockEl),
    lineNumber,
    elementPath: elementPath(blockEl),
    mdxFile,
  };
}
