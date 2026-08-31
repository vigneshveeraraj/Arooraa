import { SYNC_LANES } from "@/lib/content/work-detail/mesa";
import styles from "./EngineeringSynchronizationVisual.module.css";

const LANE_Y = [30, 90, 150, 210, 270];
const SYNC_X = [280, 620];

/**
 * Chapter 7 (rebuilt W2.1.1) — one large, substantial synchronization
 * diagram instead of five thin independent strips: five lane lines, and
 * two full-height dashed vertical lines crossing all five lanes at the
 * same two "synchronized moment" columns, so the alignment reads as one
 * connected system rather than five separate charts. The kitchen lane
 * still shows one safe branch that departs and rejoins. Lane labels are
 * real, visible text in their own column; only the diagram itself is
 * aria-hidden. No service names, APIs, or event/architecture detail.
 */
export function EngineeringSynchronizationVisual() {
  return (
    <div className={styles.chart}>
      <div className={styles.labels}>
        {SYNC_LANES.map((lane) => (
          <span key={lane} className={styles.laneLabel}>
            {lane}
          </span>
        ))}
      </div>
      <svg className={styles.svg} viewBox="0 0 900 300" preserveAspectRatio="none" aria-hidden="true">
        {SYNC_X.map((x, index) => (
          <line key={`sync-${index}`} className={styles.syncLine} x1={x} y1="10" x2={x} y2="290" />
        ))}
        {LANE_Y.map((y, index) => (
          <line key={`lane-${index}`} className={styles.laneLine} x1="20" y1={y} x2="880" y2={y} />
        ))}
        {LANE_Y.map((y, laneIndex) =>
          SYNC_X.map((x, markerIndex) => (
            <circle key={`marker-${laneIndex}-${markerIndex}`} className={styles.marker} cx={x} cy={y} r="7" />
          )),
        )}
        <path className={styles.branch} d="M400,210 Q450,175 500,210" />
        <circle className={styles.branchMarker} cx="450" cy="182" r="5" />
      </svg>
    </div>
  );
}
