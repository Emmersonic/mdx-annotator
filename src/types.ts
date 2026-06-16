export type Severity = 'bug' | 'suggestion' | 'question';

export type BlockType = 'paragraph' | 'heading' | 'codeBlock' | 'listItem' | 'other';

export interface AnnotationContext {
  quote: string; // The exact selected text
  prefix: string; // Up to 60 chars immediately before the selection in the block
  suffix: string; // Up to 60 chars immediately after the selection in the block
  blockType: BlockType;
  lineNumber?: number; // Only set for codeBlock; sourced from data-line attribute
  elementPath: string; // CSS-like path, e.g. "article > section > p:nth-of-type(2)"
  mdxFile: string; // Filename being reviewed, e.g. "getting-started.mdx"
}

export interface Annotation {
  id: string; // crypto.randomUUID()
  context: AnnotationContext;
  comment: string;
  severity: Severity;
  createdAt: string; // ISO timestamp
  status: 'queued' | 'sent';
}
