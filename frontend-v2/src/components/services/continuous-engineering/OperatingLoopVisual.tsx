import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./OperatingLoopVisual.module.css";

const STAGES = [
  { label: "Observe", x: 50, y: 10 },
  { label: "Triage", x: 81, y: 25 },
  { label: "Prioritize", x: 89, y: 59 },
  { label: "Fix", x: 67, y: 86 },
  { label: "Release", x: 33, y: 86 },
  { label: "Learn", x: 11, y: 59 },
  { label: "Improve", x: 19, y: 25 },
];

/**
 * The flagship visual for Continuous Engineering's Operating Model section
 * (S7, upgraded S8) — a circular operating wheel, not a pill row. Seven
 * stage labels (Observe → Triage → Prioritize → Fix → Release → Learn →
 * Improve, in clockwise reading order) sit on a ring; a conic-gradient
 * highlight near "Observe" suggests the cycle is live and in motion rather
 * than a static one-time sequence. A small editorial figure sits at the
 * hub, tending the loop — the wheel isn't unattended automation, it's a
 * team's ongoing operating rhythm. Percentage-based positioning (not fixed
 * pixels) keeps it fluid at any container width. The same seven stages are
 * already named in the Approach section's own body copy, in the same
 * order, so the whole wheel stays decorative (aria-hidden) with no loss of
 * information.
 */
export function OperatingLoopVisual() {
  return (
    <div className={styles.wheel} aria-hidden="true">
      <div className={styles.trackOuter} />
      <div className={styles.trackInner} />
      <div className={styles.hub} />
      <svg className={styles.tender} viewBox="0 0 60 60">
        <EditorialFigure x={30} y={44} scale={0.35} />
      </svg>
      {STAGES.map((stage) => (
        <span key={stage.label} className={styles.stage} style={{ left: `${stage.x}%`, top: `${stage.y}%` }}>
          {stage.label}
        </span>
      ))}
    </div>
  );
}
