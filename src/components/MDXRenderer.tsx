import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import rehypePrettyCode from 'rehype-pretty-code';
import { CodeBlock } from './CodeBlock';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, type ComponentType } from 'react';
import type * as React from 'react';

interface MDXRendererProps {
  file: string;
  renderAnnotatable: (content: React.ReactNode) => React.ReactNode;
}

export function MDXRenderer({ file, renderAnnotatable }: MDXRendererProps) {
  const [Content, setContent] = useState<ComponentType<{
    components?: Record<string, ComponentType<any>>;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setContent(null);
    setError(null);

    fetch(`/content/${file}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then((mdxText) =>
        evaluate(mdxText, {
          ...runtime,
          rehypePlugins: [
            [rehypePrettyCode, { theme: 'github-dark', keepBackground: true }],
          ],
        }),
      )
      .then((mod) => {
        if (!ignore) setContent(() => mod.default as any);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      ignore = true;
    };
  }, [file]);

  if (error) {
    return (
      <p className="mt-8 text-sm text-red-500">
        Failed to load <code>{file}</code>: {error}
      </p>
    );
  }

  if (!Content) {
    return (
      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return renderAnnotatable(
    <article className="prose prose-neutral max-w-none">
      <Content components={{ pre: CodeBlock }} />
    </article>,
  );
}
