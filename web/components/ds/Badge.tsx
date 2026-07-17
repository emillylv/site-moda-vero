import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "premium" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: Variant;
}

/** Badge/etiqueta de status do design system Moda BH Vero. */
export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={["ds-badge", `ds-badge--${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
