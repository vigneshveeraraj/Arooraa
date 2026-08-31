import styles from "./SmartMirrorMomentsRow.module.css";

const MOMENTS = ["Getting Ready", "Before Leaving", "Coming Home", "Before Bed"];

/**
 * A companion visual for Why We Built It (P4) — the four natural moments
 * named in that section's own copy, as a simple restrained chip row.
 * Deliberately not another mirror-frame composition (the brief explicitly
 * warns against repeated identical mirror visuals across the page), so
 * this stays a plain, quiet supporting visual rather than a sixth mirror
 * illustration. Every label is real, accessible text.
 */
export function SmartMirrorMomentsRow() {
  return (
    <ul className={styles.moments}>
      {MOMENTS.map((moment, index) => (
        <li key={moment} className={styles.moment}>
          <span className={styles.index}>{index + 1}</span>
          <span className={styles.label}>{moment}</span>
        </li>
      ))}
    </ul>
  );
}
