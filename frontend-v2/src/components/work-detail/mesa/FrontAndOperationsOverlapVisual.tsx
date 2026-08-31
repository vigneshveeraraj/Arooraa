import { FRONT_OF_EXPERIENCE, OPERATING_REALITY } from "@/lib/content/work-detail/mesa";
import styles from "./FrontAndOperationsOverlapVisual.module.css";

/**
 * Chapter 9 — two overlapping panels (Front Of Experience / Operating
 * Reality), each listing its own real, visible items, with "MESA" sitting
 * in the overlap. Below 640px the overlap gives way to two plain stacked
 * panels with the badge between them, rather than cramming curved text
 * into a shrinking circle.
 */
export function FrontAndOperationsOverlapVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.circle} ${styles.circleLeft}`}>
        <p className={styles.circleLabel}>Front Of Experience</p>
        <ul className={styles.itemList}>
          {FRONT_OF_EXPERIENCE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <span className={styles.overlapBadge}>MESA</span>
      <div className={`${styles.circle} ${styles.circleRight}`}>
        <p className={styles.circleLabel}>Operating Reality</p>
        <ul className={styles.itemList}>
          {OPERATING_REALITY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
