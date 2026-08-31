import { ENGINEERING_RANGE_POINTS } from "@/lib/content/our-work";
import styles from "./EngineeringRangeVisual.module.css";

/**
 * The engineering-range spectrum (W1 §21) — a conceptual software↔physical
 * scale, not a measured chart: each product gets a short pill positioned by
 * percentage along the track (a dot for a mostly-software product, a longer
 * pill for one that spans further toward physical). Product names stay real,
 * visible text so a screen reader still gets "Mindra, MESA, Smart Mirror,
 * Smart Home, in that order" — only the geometric bar/track itself (whose
 * exact position isn't something a screen reader can convey meaningfully
 * anyway) is aria-hidden; the section's own heading description already
 * states the underlying idea in words.
 */
export function EngineeringRangeVisual() {
  return (
    <div className={styles.chart}>
      <div className={styles.axisLabels} aria-hidden="true">
        <span>Software</span>
        <span>Physical</span>
      </div>
      {ENGINEERING_RANGE_POINTS.map((point) => (
        <div key={point.slug} className={styles.row}>
          <span className={styles.rowLabel}>{point.name}</span>
          <div className={styles.track} aria-hidden="true">
            <div
              className={styles.marker}
              style={{ left: `${point.start}%`, width: `${Math.max(point.end - point.start, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
