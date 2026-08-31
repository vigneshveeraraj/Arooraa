import styles from "./Wordmark.module.css";

interface WordmarkProps {
  /** primary = the main brand treatment (hero/header). compact = constrained contexts (footer, dense UI). */
  size?: "primary" | "compact";
  className?: string;
}

/**
 * Clean textual "AROORAA" treatment only — no icon/mark, no gradient. The
 * permanent brand mark is a separate, later design decision (Phase 0 §3 / M1 §7).
 */
export function Wordmark({ size = "primary", className }: WordmarkProps) {
  const sizeClass = size === "compact" ? styles.compact : styles.primary;
  return <span className={[styles.wordmark, sizeClass, className].filter(Boolean).join(" ")}>AROORAA</span>;
}
