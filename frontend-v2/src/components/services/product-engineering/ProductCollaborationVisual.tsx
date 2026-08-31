import styles from "./ProductCollaborationVisual.module.css";

/**
 * The Human + Engineering collaboration section's companion visual (S3) —
 * a small, fully abstract connector: a soft cluster of overlapping circles
 * (product thinking — exploratory) linked to a tight grid of squares
 * (engineering — structured) by a plain line with one neutral node at the
 * midpoint. Deliberately restrained relative to ProductAssemblyVisual (the
 * page's one strong signature visual) and deliberately not the robot +
 * butterfly motif, which is reserved for AI, Data & Automation. The
 * underlying idea is already stated as real text in the section's own
 * Product Thinking / Engineering lists, so this stays decorative.
 */
export function ProductCollaborationVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 320 100" aria-hidden="true">
      <circle className={styles.thinkingCircle} cx="30" cy="50" r="14" />
      <circle className={styles.thinkingCircle} cx="48" cy="38" r="10" />
      <circle className={styles.thinkingCircle} cx="48" cy="64" r="10" />

      <line className={styles.link} x1="66" y1="50" x2="240" y2="50" />
      <circle className={styles.node} cx="153" cy="50" r="5" />

      <rect className={styles.engineeringSquare} x="256" y="36" width="16" height="16" rx="2" />
      <rect className={styles.engineeringSquare} x="278" y="36" width="16" height="16" rx="2" />
      <rect className={styles.engineeringSquare} x="267" y="58" width="16" height="16" rx="2" />
    </svg>
  );
}
