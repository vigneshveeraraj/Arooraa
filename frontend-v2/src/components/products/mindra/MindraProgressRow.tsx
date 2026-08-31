import styles from "./MindraProgressRow.module.css";

interface MindraProgressRowProps {
  current: number;
  total: number;
}

/**
 * A restrained progress indicator for the MindraLifeDashboard's Groceries
 * card (P3.2) — a plain "current of total" count with a small segmented
 * bar, not a percentage or growth metric. This is illustrative example
 * state (a sample grocery list's progress), not a real or fabricated usage
 * statistic. The segment bar is purely decorative (the count text already
 * carries the same information as real text), so only the bar is
 * aria-hidden.
 */
export function MindraProgressRow({ current, total }: MindraProgressRowProps) {
  const segments = Array.from({ length: total }, (_, index) => index < current);
  return (
    <div className={styles.progress}>
      <span className={styles.count}>
        {current} of {total}
      </span>
      <div className={styles.segments} aria-hidden="true">
        {segments.map((filled, index) => (
          <span key={index} className={`${styles.segment} ${filled ? styles.filled : ""}`} />
        ))}
      </div>
    </div>
  );
}
