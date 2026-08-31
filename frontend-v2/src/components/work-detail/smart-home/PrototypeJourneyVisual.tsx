import { JOURNEY_STAGES } from "@/lib/content/work-detail/smart-home";
import styles from "./PrototypeJourneyVisual.module.css";

/**
 * Chapter 12 — an editorial staged journey, not a corporate Gantt chart:
 * seven numbered steps on one connecting line, each a real sentence
 * rather than a task bar or a date range.
 */
export function PrototypeJourneyVisual() {
  return (
    <ol className={styles.journey}>
      {JOURNEY_STAGES.map((stage, index) => (
        <li key={stage} className={styles.step}>
          <span className={styles.marker} aria-hidden="true">
            <span className={styles.markerNumber}>{index + 1}</span>
          </span>
          <span className={styles.stageText}>{stage}</span>
        </li>
      ))}
    </ol>
  );
}
