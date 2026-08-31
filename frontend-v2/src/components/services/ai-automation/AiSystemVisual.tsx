import styles from "./AiSystemVisual.module.css";

const SIGNALS = [
  { cx: 30, cy: 50, r: 3, opacity: 0.5 },
  { cx: 55, cy: 35, r: 2.5, opacity: 0.4 },
  { cx: 45, cy: 80, r: 3.5, opacity: 0.55 },
  { cx: 70, cy: 100, r: 2, opacity: 0.35 },
  { cx: 35, cy: 120, r: 3, opacity: 0.45 },
  { cx: 60, cy: 140, r: 2.5, opacity: 0.3 },
];

/**
 * The "How It Fits Together" section's companion visual (S4, reworked
 * S8.1) — a genuine picture rather than a labeled stage list: loose,
 * scattered raw-data marks pass through a funnel (the intelligence layer,
 * narrowing/refining) into one clean action card marked with a checkmark,
 * with a small ring badge standing for human review at the handoff point.
 * Illustrates "data becoming usable intelligence" / "signals becoming
 * action" as a spatial scene. The same four-stage idea is already stated as
 * real text in this section's own body copy, so the whole scene stays
 * decorative (aria-hidden).
 */
export function AiSystemVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 480 180" aria-hidden="true">
      {SIGNALS.map((signal, index) => (
        <circle
          key={index}
          className={styles.signal}
          cx={signal.cx}
          cy={signal.cy}
          r={signal.r}
          opacity={signal.opacity}
        />
      ))}

      <path className={styles.filter} d="M100,25 L190,80 L190,100 L100,155 Z" />

      <line className={styles.arrow} x1="190" y1="90" x2="222" y2="90" />
      <path className={styles.arrowhead} d="M222,80 L242,90 L222,100 Z" />

      <rect className={styles.output} x="252" y="55" width="120" height="70" rx="10" />
      <path className={styles.actionMark} d="M274,92 L292,108 L336,64" />

      <circle className={styles.controlRing} cx="372" cy="45" r="9" />
    </svg>
  );
}
