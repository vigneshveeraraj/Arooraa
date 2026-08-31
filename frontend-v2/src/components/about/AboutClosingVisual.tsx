import { AboutSpark } from "./AboutSpark";
import styles from "./AboutClosingVisual.module.css";

/**
 * Purely decorative closing visual (matches the established
 * WorkDetailCta-adjacent closing pattern from the /our-work/* stories) — a
 * soft glow and one large AROORAA Spark. All real closing text (heading,
 * supporting copy, principle line) lives in AboutClosingStory's copy
 * column, not here.
 */
export function AboutClosingVisual() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <span className={styles.glow} />
      <span className={styles.card}>
        <AboutSpark size={56} className={styles.spark} />
      </span>
    </div>
  );
}
