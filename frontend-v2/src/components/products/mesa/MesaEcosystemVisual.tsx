import styles from "./MesaEcosystemVisual.module.css";

/**
 * A deliberately abstract conceptual visual (P2 §3/§20) — four safe,
 * public-facing category labels around a MESA core. No architecture,
 * service names, or system internals are represented. Purely decorative:
 * every concept it names already exists as real accessible text elsewhere
 * on the page (Hero copy, The Problem, What It Does), so the whole graphic
 * stays aria-hidden.
 */
export function MesaEcosystemVisual() {
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

      <text className={styles.label} x="118" y="112" textAnchor="end">
        <tspan x="118" dy="0">
          Guest
        </tspan>
        <tspan x="118" dy="18">
          Experience
        </tspan>
      </text>
      <text className={styles.label} x="362" y="112" textAnchor="start">
        <tspan x="362" dy="0">
          Restaurant
        </tspan>
        <tspan x="362" dy="18">
          Operations
        </tspan>
      </text>
      <text className={styles.label} x="118" y="372" textAnchor="end">
        Kitchen
      </text>
      <text className={styles.label} x="362" y="372" textAnchor="start">
        Management
      </text>

      <circle className={styles.core} cx="240" cy="240" r="30" />
      <text className={styles.coreLabel} x="240" y="245" textAnchor="middle">
        MESA
      </text>
    </svg>
  );
}
