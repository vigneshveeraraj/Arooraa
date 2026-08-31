import styles from "./HeroVisual.module.css";

/**
 * Purely decorative — AROORAA (core) connected to its four products (outer
 * nodes), reinforcing "one company, multiple engineered products." The
 * product names are duplicated here only as a visual label; the accessible
 * copy already lives in the product strip below, so the whole graphic stays
 * aria-hidden rather than repeating the names to screen readers too.
 */
export function HeroVisual() {
  return (
    <svg viewBox="0 0 480 480" className={styles.svg} aria-hidden="true">
      <circle className={styles.orbit} cx="240" cy="240" r="92" />

      <line className={styles.link} x1="240" y1="240" x2="346" y2="134" />
      <line className={styles.link} x1="240" y1="240" x2="134" y2="134" />
      <line className={styles.link} x1="240" y1="240" x2="134" y2="346" />
      <line className={styles.link} x1="240" y1="240" x2="346" y2="346" />

      <circle className={styles.node} cx="346" cy="134" r="14" />
      <circle className={styles.node} cx="134" cy="134" r="14" />
      <circle className={styles.node} cx="134" cy="346" r="14" />
      <circle className={styles.node} cx="346" cy="346" r="14" />

      <text className={styles.label} x="362" y="108" textAnchor="start">
        MESA
      </text>
      <text className={styles.label} x="118" y="108" textAnchor="end">
        Mindra
      </text>
      <text className={styles.label} x="118" y="362" textAnchor="end">
        <tspan x="118" dy="0">
          Smart
        </tspan>
        <tspan x="118" dy="18">
          Mirror
        </tspan>
      </text>
      <text className={styles.label} x="362" y="362" textAnchor="start">
        <tspan x="362" dy="0">
          Smart Home
        </tspan>
        <tspan x="362" dy="18">
          EB
        </tspan>
      </text>

      <circle className={styles.core} cx="240" cy="240" r="30" />
    </svg>
  );
}
