import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  children: ReactNode;
}

/** Agrupa label + controle, no espaçamento do design system. */
export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="ds-field">
      {label ? (
        <label className="ds-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={["ds-input", className].filter(Boolean).join(" ")} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={["ds-select", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={["ds-textarea", className].filter(Boolean).join(" ")} {...props} />
  );
}
