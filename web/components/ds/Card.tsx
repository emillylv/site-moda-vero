import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

/** Card do design system: fundo papel, sombra suave, cantos discretos. */
export function Card({ children, hoverable = false, className, ...props }: CardProps) {
  return (
    <div
      className={["ds-card", hoverable ? "ds-card--hoverable" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
