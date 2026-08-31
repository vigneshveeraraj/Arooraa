import styles from "./ContinuousPulseVisual.module.css";

/**
 * The signature hero visual for Continuous Engineering (S7) — deliberately
 * more dynamic than the other service pages' hero treatments. A shallow
 * arc (ongoing motion/cadence) carries a few faint "signal" dots and one
 * brighter, halo'd "live" dot (current operating state); a heartbeat-style
 * pulse line beneath it stands in for product health rhythm. Visually
 * distinct from the Approach section's full labeled operating-loop wheel
 * below, so the two flagship visuals don't repeat the same composition.
 * Purely conceptual — no real signal/metric data, no medical iconography
 * beyond a simple abstract blip. The same ideas (health, signals, ongoing
 * cadence) are already stated as real text in the hero copy, so this stays
 * decorative.
 */
export function ContinuousPulseVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 400 220" aria-hidden="true">
      <path className={styles.arc} d="M30,70 C140,10 260,10 370,70" />

      <circle className={styles.signal} cx="90" cy="35" r="4" opacity="0.35" />
      <circle className={styles.signal} cx="160" cy="18" r="5" opacity="0.5" />
      <circle className={styles.signal} cx="240" cy="18" r="5" opacity="0.5" />
      <circle className={styles.signal} cx="310" cy="35" r="4" opacity="0.35" />

      <circle className={styles.halo} cx="200" cy="15" r="14" />
      <circle className={styles.live} cx="200" cy="15" r="6" />

      <path className={styles.pulse} d="M20,170 L110,170 L128,120 L146,200 L164,140 L182,170 L380,170" />
    </svg>
  );
}
