import { FUTURE_ITEMS, NOW_ITEMS } from "@/lib/content/work-detail/mindra";
import styles from "./NowFutureSplit.module.css";

/**
 * Chapter 10, part B — a clear, unmistakable visual difference between
 * what's available now (solid, accent-bordered chips) and what's future
 * direction (dashed, muted chips) — the current-vs-future distinction the
 * whole page depends on, made explicit one final time before the close.
 */
export function NowFutureSplit() {
  return (
    <div className={styles.split}>
      <div className={styles.column}>
        <p className={styles.columnLabel}>Available / Current Foundation</p>
        <ul className={styles.chips}>
          {NOW_ITEMS.map((item) => (
            <li key={item} className={styles.nowChip}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.column}>
        <p className={styles.columnLabel}>Future Direction</p>
        <ul className={styles.chips}>
          {FUTURE_ITEMS.map((item) => (
            <li key={item} className={styles.futureChip}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
