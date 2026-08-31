import styles from "./AboutSpark.module.css";

interface AboutSparkProps {
  size?: number;
  className?: string;
}

/**
 * The "AROORAA Spark" (W3.1 §23) — the page's one recurring motif for
 * "thinking becoming product": a four-point luminous mark, not a lightbulb
 * icon and not a new company logo. Reused sparingly (hero, origin moment,
 * future horizon, closing) so it reads as a deliberate thread rather than
 * decoration repeated for its own sake.
 */
export function AboutSpark({ size = 24, className }: AboutSparkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[styles.spark, className].filter(Boolean).join(" ")}
    >
      <path d="M12 1 C12.9 7.1 16.9 11.1 23 12 C16.9 12.9 12.9 16.9 12 23 C11.1 16.9 7.1 12.9 1 12 C7.1 11.1 11.1 7.1 12 1 Z" />
    </svg>
  );
}
