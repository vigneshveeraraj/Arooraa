import type { ReactNode } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  helper?: string;
  error?: string;
  required?: boolean;
  /** Layout-only escape hatch (W3.2A.2) — e.g. capping a textarea's reading
   * width without affecting every other field that uses this component. */
  className?: string;
  children: ReactNode;
}

/** Predictable ids for a field's helper/error text, for wiring `aria-describedby`
 * on the actual input (W3.2A §38). Callers build the input themselves, since
 * this component only owns the surrounding label/helper/error layout. */
export function describedBy(htmlFor: string, opts: { helper?: boolean; error?: boolean }): string | undefined {
  const ids = [opts.helper ? `${htmlFor}-helper` : null, opts.error ? `${htmlFor}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function FormField({ label, htmlFor, helper, error, required, className, children }: FormFieldProps) {
  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {helper ? (
        <p id={`${htmlFor}-helper`} className={styles.helper}>
          {helper}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
