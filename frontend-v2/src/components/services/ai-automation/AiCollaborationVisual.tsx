import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./AiCollaborationVisual.module.css";

/**
 * The Human + Machine section's companion visual (S4, upgraded S8) — three
 * structured squares (the machine side) linked to an editorial human
 * figure (the human side) by a line with a single accent dot at the
 * midpoint, standing in for the "handoff" between automation and judgment.
 * The figure uses the same shared, faceless duotone silhouette as every
 * other picture-story visual across the service pages (not a humanoid
 * robot or stock-AI illustration — the site's one consistent, restrained
 * human-illustration language). The underlying idea is already stated as
 * real text in the section's own Machine/Human lists, so this stays
 * decorative.
 */
export function AiCollaborationVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 320 100" aria-hidden="true">
      <rect className={styles.square} x="18" y="18" width="20" height="20" rx="3" />
      <rect className={styles.square} x="34" y="42" width="20" height="20" rx="3" />
      <rect className={styles.square} x="18" y="66" width="20" height="20" rx="3" />

      <line className={styles.link} x1="64" y1="50" x2="240" y2="50" />
      <circle className={styles.trail} cx="140" cy="50" r="3" />
      <circle className={styles.handoff} cx="160" cy="50" r="5" />
      <circle className={styles.trail} cx="180" cy="50" r="3" />

      <EditorialFigure x={280} y={72} scale={0.55} flip />
    </svg>
  );
}
