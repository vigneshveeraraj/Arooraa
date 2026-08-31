import type { CSSProperties } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { ACTIVE_SCREEN_STEPS, AMBIENT_GLANCE_STEPS, INTERACTION_QUESTION } from "@/lib/content/work-detail/smart-mirror";
import styles from "./InteractionContrastVisual.module.css";

const VIEW_W = 680;
const VIEW_H = 420;

// Five widely-drifting positions accumulating above the phone — a denser,
// busier path — versus one tight cluster of three beside the mirror.
const ACTIVE_POSITIONS = [
  { x: 150, y: 300 },
  { x: 95, y: 250 },
  { x: 150, y: 205 },
  { x: 90, y: 160 },
  { x: 150, y: 115 },
];
const GLANCE_POSITIONS = [
  { x: 540, y: 205 },
  { x: 540, y: 250 },
  { x: 540, y: 295 },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 1 — a larger editorial interaction scene, not a comparison
 * table: a person on the left reaches for a phone, with five steps
 * accumulating into a dense, drifting trail above it (friction made
 * visible through count and spread); a person on the right glances toward
 * the mirror, with three steps resting calmly in one tight cluster beside
 * it. One interaction asks for attention; the other quietly supports the
 * moment.
 */
export function InteractionContrastVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          <EditorialFigure x={150} y={400} scale={1.7} />
          <rect className={styles.phone} x="178" y="255" width="34" height="58" rx="7" />

          <EditorialFigure x={540} y={400} scale={1.7} flip />
          <rect className={styles.mirror} x="452" y="150" width="58" height="80" rx="12" />
          <line className={styles.mirrorSheen} x1="466" y1="160" x2="466" y2="220" />
        </svg>

        {ACTIVE_SCREEN_STEPS.map((step, index) => {
          const pos = ACTIVE_POSITIONS[index]!;
          return (
            <span key={step} className={styles.activeStep} style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) } as CSSProperties}>
              {step}
            </span>
          );
        })}

        {AMBIENT_GLANCE_STEPS.map((step, index) => {
          const pos = GLANCE_POSITIONS[index]!;
          return (
            <span key={step} className={styles.glanceStep} style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) } as CSSProperties}>
              {step}
            </span>
          );
        })}

        <p className={styles.sceneLabel} style={{ left: pct(150, VIEW_W) } as CSSProperties}>
          Active Screen
        </p>
        <p className={styles.sceneLabel} style={{ left: pct(540, VIEW_W) } as CSSProperties}>
          Ambient Glance
        </p>
      </div>

      <p className={styles.question}>{INTERACTION_QUESTION}</p>
    </div>
  );
}
