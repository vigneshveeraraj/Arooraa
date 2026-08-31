import { CURRENT_ITEMS, CURRENT_LABEL, FUTURE_ITEMS, FUTURE_LABEL } from "@/lib/content/work-detail/smart-home";
import styles from "./CurrentVsFutureVisual.module.css";

/**
 * Chapter 14 — two columns with deliberately different visual treatment:
 * current/prototype items are solid, accent-bordered chips; future items
 * are dashed and muted. No ambiguity about which is which.
 */
export function CurrentVsFutureVisual() {
  return (
    <div className={styles.columns}>
      <div className={styles.column}>
        <p className={styles.columnLabel}>{CURRENT_LABEL}</p>
        <ul className={styles.currentList}>
          {CURRENT_ITEMS.map((item) => (
            <li key={item} className={styles.currentItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.column}>
        <p className={styles.columnLabel}>{FUTURE_LABEL}</p>
        <ul className={styles.futureList}>
          {FUTURE_ITEMS.map((item) => (
            <li key={item} className={styles.futureItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
