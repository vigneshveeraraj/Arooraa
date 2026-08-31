import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./ModernizationTransformationVisual.module.css";

/**
 * The signature visual for Application Modernization (S5, upgraded S8) —
 * "from constrained system to evolvable platform." Left: a denser cluster
 * of overlapping, irregularly rotated blocks with crossing lines (tangled
 * coupling). Right: fewer, evenly stacked blocks on one clean spine
 * (clearer boundaries). One block (accent-colored, dashed-connected) is
 * deliberately drawn on both sides at a similar relative position — the
 * same piece carried forward, not discarded — matching the page's own
 * "modernization evolves the system; it does not discard business value by
 * default" message, which is stated as real text in the section body. An
 * editorial engineer figure sits above the transition arrow, carrying a
 * small accent-colored piece across from the tangled side to the clean
 * side — a human, deliberate hand in the transformation, not an automatic
 * or unattended process. Purely conceptual: no real architecture, service
 * names or AROORAA/MESA internals. Aria-hidden since the same idea is
 * already real text in this section and Outcomes.
 */
export function ModernizationTransformationVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 520 260" aria-hidden="true">
      <line className={styles.continuity} x1="65" y1="187" x2="375" y2="207" />

      <line className={styles.tangle} x1="60" y1="55" x2="150" y2="135" />
      <line className={styles.tangle} x1="95" y1="105" x2="65" y2="185" />
      <line className={styles.tangle} x1="150" y1="55" x2="70" y2="105" />
      <line className={styles.tangle} x1="155" y1="140" x2="50" y2="50" />

      <rect className={styles.beforeBlock} x="30" y="40" width="40" height="30" rx="3" transform="rotate(8 50 55)" />
      <rect className={styles.beforeBlock} x="100" y="40" width="60" height="30" rx="3" transform="rotate(-6 130 55)" />
      <rect className={styles.beforeBlock} x="60" y="90" width="70" height="28" rx="3" transform="rotate(4 95 104)" />
      <rect className={styles.beforeBlock} x="130" y="120" width="50" height="40" rx="3" transform="rotate(-3 155 140)" />
      <rect className={styles.preserved} x="40" y="170" width="50" height="34" rx="4" />

      <line className={styles.arrowLine} x1="210" y1="140" x2="300" y2="140" />
      <path className={styles.arrowHead} d="M300,130 L320,140 L300,150 Z" />

      <EditorialFigure x={255} y={110} scale={0.5} />
      <rect className={styles.carried} x="240" y="126" width="16" height="12" rx="2" />

      <line className={styles.spine} x1="420" y1="70" x2="420" y2="224" />
      <rect className={styles.afterBlock} x="350" y="70" width="140" height="28" rx="6" />
      <rect className={styles.afterBlock} x="350" y="110" width="140" height="28" rx="6" />
      <rect className={styles.afterBlock} x="350" y="150" width="140" height="28" rx="6" />
      <rect className={styles.preserved} x="350" y="190" width="50" height="34" rx="6" />
    </svg>
  );
}
