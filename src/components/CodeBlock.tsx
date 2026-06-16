import type * as React from 'react';

export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  return <pre {...props} data-code-block="true" />;
}
