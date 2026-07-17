import type { ReactNode } from "react";

type Level = 1 | 2 | 3 | 4;

interface HeadingProps {
  level?: Level;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Título editorial (Cormorant Garamond) do design system.
 * Mapeia o nível semântico para a tag correspondente.
 */
export function Heading({ level = 2, children, className, id }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}
