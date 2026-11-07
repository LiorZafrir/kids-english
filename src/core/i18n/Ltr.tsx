import type { ElementType, ReactNode } from 'react';

interface LtrProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/**
 * Wrap ALL English content in this inside the RTL UI so direction never leaks.
 * `unicode-bidi: isolate` (in global.css) keeps punctuation from jumping sides.
 */
export function Ltr({ children, as: Tag = 'span', className }: LtrProps) {
  return (
    <Tag dir="ltr" lang="en" className={className ? `ltr ${className}` : 'ltr'}>
      {children}
    </Tag>
  );
}
