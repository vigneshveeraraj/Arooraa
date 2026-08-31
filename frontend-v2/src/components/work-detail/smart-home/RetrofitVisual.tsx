import { RETROFIT_CONSIDERATIONS, RETROFIT_STAGES } from "@/lib/content/work-detail/smart-home";
import styles from "./RetrofitVisual.module.css";

const MARK_COUNTS = [0, 3, 3];

/**
 * Chapter 8 — the same house silhouette shown three times: plain, with a
 * few upgrade areas marked, then with a subtle smart layer added over the
 * unchanged structure — never demolished or rebuilt, just carefully
 * layered.
 */
export function RetrofitVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stages}>
        {RETROFIT_STAGES.map((stage, index) => (
          <div key={stage} className={styles.stage}>
            <svg className={styles.house} viewBox="0 0 120 110" aria-hidden="true">
              <path className={index === 2 ? styles.houseOutlineSmart : styles.houseOutline} d="M10 55 L60 15 L110 55 V100 H10 Z" />
              <rect className={index === 2 ? styles.doorSmart : styles.door} x="52" y="70" width="16" height="30" rx="2" />
              {index >= 1
                ? [
                    { x: 25, y: 65 },
                    { x: 85, y: 65 },
                    { x: 60, y: 40 },
                  ]
                    .slice(0, MARK_COUNTS[index])
                    .map((mark, markIndex) => <circle key={markIndex} className={styles.mark} cx={mark.x} cy={mark.y} r="4.5" />)
                : null}
              {index === 2 ? <rect className={styles.smartOverlay} x="10" y="55" width="100" height="45" /> : null}
            </svg>
            <p className={styles.stageName}>{stage}</p>
          </div>
        ))}
      </div>

      <ul className={styles.considerations}>
        {RETROFIT_CONSIDERATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
