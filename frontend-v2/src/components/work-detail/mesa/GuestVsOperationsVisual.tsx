import { GUEST_JOURNEY, OPERATIONAL_MOMENTS } from "@/lib/content/work-detail/mesa";
import styles from "./GuestVsOperationsVisual.module.css";

const BRANCH_PATHS = [
  "M40,10 Q40,40 20,70",
  "M120,10 Q120,40 90,70",
  "M200,10 Q200,40 180,70",
  "M280,10 Q280,40 260,70",
  "M360,10 Q360,40 340,70",
  "M440,10 Q440,40 420,70",
  "M520,10 Q520,40 480,70",
];

/**
 * Chapter 1's editorial visual — one clean guest-journey line on top, a
 * denser cluster of operational moments below, connected by a few faint
 * fanning branch lines rather than a full wiring diagram. Both lists are
 * real, visible text (they're the chapter's actual content, not
 * decoration); only the connecting branch paths are aria-hidden. The
 * cluster's slight per-item rotation and larger type is the only thing
 * making it feel "denser" than the calm guest line above it.
 */
export function GuestVsOperationsVisual() {
  return (
    <div className={styles.wrapper}>
      <ol className={styles.guestLine} aria-label="What the guest experiences">
        {GUEST_JOURNEY.map((step) => (
          <li key={step} className={styles.guestStep}>
            {step}
          </li>
        ))}
      </ol>

      <svg className={styles.branches} viewBox="0 0 560 80" aria-hidden="true" preserveAspectRatio="none">
        {BRANCH_PATHS.map((d, index) => (
          <path key={index} className={styles.branch} d={d} />
        ))}
      </svg>

      <ul className={styles.operationalCluster} aria-label="What the restaurant coordinates">
        {OPERATIONAL_MOMENTS.map((moment, index) => (
          <li key={moment} className={styles.operationalTag} style={{ transform: `rotate(${((index % 5) - 2) * 2}deg)` }}>
            {moment}
          </li>
        ))}
      </ul>
    </div>
  );
}
