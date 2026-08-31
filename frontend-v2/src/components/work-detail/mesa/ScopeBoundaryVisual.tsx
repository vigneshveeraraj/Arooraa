import { BOUNDARY_INSIDE, BOUNDARY_OUTSIDE } from "@/lib/content/work-detail/mesa";
import styles from "./ScopeBoundaryVisual.module.css";

/**
 * Chapter 12's scope boundary — a dashed-bordered "inside" region holding
 * what MESA actually is today, and a visually muted "outside" region for
 * what was deliberately left for later. No roadmap items are named — both
 * sides stay at the philosophical level the brief asked for.
 */
export function ScopeBoundaryVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inside}>
        <p className={styles.insideLabel}>Inside The Boundary</p>
        <ul className={styles.list}>
          {BOUNDARY_INSIDE.map((item) => (
            <li key={item} className={styles.insideItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.outside}>
        <p className={styles.outsideLabel}>Outside / Later</p>
        <ul className={styles.list}>
          {BOUNDARY_OUTSIDE.map((item) => (
            <li key={item} className={styles.outsideItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
