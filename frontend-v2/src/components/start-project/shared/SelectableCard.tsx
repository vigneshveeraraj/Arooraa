import type { CSSProperties, ReactNode } from "react";
import styles from "./SelectableCard.module.css";

export interface CardAccent {
  color: string;
  background: string;
}

interface SelectableCardProps {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  icon?: ReactNode;
  label: string;
  description?: string;
  /** Per-card icon theming, applied as CSS custom properties (crosses the
   * CSS Modules file boundary cleanly — a cross-module class selector can't
   * reach this component's own scoped `.icon` class name). */
  accent?: CardAccent;
}

/**
 * The Step 1 "solution model" / "engagement model" card (W3.2A §6–8) — a
 * real, native `<input type="radio">` (or checkbox) visually styled as a
 * card, so selection keeps proper form semantics, works with the keyboard
 * out of the box, and gets a real focus ring for free. Selected state is
 * never color-only: a checkmark badge renders whenever `checked` is true.
 */
export function SelectableCard({
  type = "radio",
  name,
  value,
  checked,
  onChange,
  icon,
  label,
  description,
  accent,
}: SelectableCardProps) {
  const inputId = `${name}-${value}`;
  const accentStyle = accent
    ? ({ "--card-accent": accent.color, "--card-accent-bg": accent.background } as CSSProperties)
    : undefined;
  return (
    <label
      htmlFor={inputId}
      className={[styles.card, checked ? styles.selected : ""].filter(Boolean).join(" ")}
      style={accentStyle}
    >
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={styles.input}
      />
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.textBlock}>
        <span className={`text-h4 ${styles.label}`}>{label}</span>
        {description ? <span className={`text-body-sm ${styles.description}`}>{description}</span> : null}
      </span>
      {checked ? (
        <span className={styles.checkMark} aria-hidden="true">
          ✓
        </span>
      ) : null}
    </label>
  );
}
