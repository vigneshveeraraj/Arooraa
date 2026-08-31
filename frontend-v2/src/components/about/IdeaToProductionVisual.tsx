import { IDEA_TO_PRODUCTION } from "@/lib/content/about";
import styles from "./IdeaToProductionVisual.module.css";

/**
 * Chapter 04's sketch-to-system visual (W3.1 §10) — the same journey drawn
 * three times over as it moves left to right: rough/dashed marks for the
 * earliest, least-certain stages, gradually resolving into clean, solid,
 * precise shapes by Launch and Continuous Support. Stage names are real
 * text; only each node's own shape is decorative.
 */
export function IdeaToProductionVisual() {
  return (
    <ol className={styles.journey}>
      {IDEA_TO_PRODUCTION.journey.map((stage, index) => {
        const tier = index < 3 ? styles.stageRough : index < 6 ? styles.stageForming : styles.stagePrecise;
        return (
          <li key={stage} className={styles.stage}>
            <span className={`${styles.node} ${tier}`} aria-hidden="true" />
            <span className={`text-label ${styles.label}`}>{stage}</span>
          </li>
        );
      })}
    </ol>
  );
}
