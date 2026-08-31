import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./PlatformFlowVisual.module.css";

const STAGE_COUNT = 7;
const STAGE_WIDTH = 64;
const STAGE_HEIGHT = 34;
const STAGE_GAP = 80;
const STAGE_Y = 24;

/**
 * The signature visual for Cloud & Platform Engineering (S6, upgraded S8) —
 * "from code to reliable production." Seven evenly spaced, unlabeled stage
 * blocks (Product Code, Build & Test, Release, Environment, Runtime/
 * Platform, Production, Signals/Observability, in that order) connected by
 * forward arrows, plus one curved feedback path from the last block back
 * toward the second — communicating that delivery is a closed loop, not a
 * one-way upload. An editorial operator figure with a small accent
 * "screen" sits below and to the right of the final Signals stage,
 * watching the flow — not part of the mechanical pipeline, but the person
 * the observability work is ultimately for. Deliberately unlabeled and
 * abstract, not a literal CI/CD architecture diagram: the same seven ideas
 * are already named as real text in this section's own body copy.
 * Aria-hidden for that reason.
 */
export function PlatformFlowVisual() {
  const stages = Array.from({ length: STAGE_COUNT }, (_, index) => {
    const x = 20 + index * STAGE_GAP;
    return { x, centerX: x + STAGE_WIDTH / 2, endX: x + STAGE_WIDTH };
  });
  const lastStage = stages[STAGE_COUNT - 1]!;
  const feedbackTarget = stages[1]!;

  return (
    <svg className={styles.svg} viewBox="0 0 590 190" aria-hidden="true">
      {stages.map((stage, index) => (
        <rect
          key={index}
          className={index === stages.length - 1 ? styles.signalStage : styles.stage}
          x={stage.x}
          y={STAGE_Y}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          rx="6"
        />
      ))}

      {stages.slice(0, -1).map((stage, index) => (
        <path
          key={index}
          className={styles.arrowHead}
          d={`M${stage.endX + 4},${STAGE_Y + STAGE_HEIGHT / 2 - 6} L${stage.endX + 14},${STAGE_Y + STAGE_HEIGHT / 2} L${stage.endX + 4},${STAGE_Y + STAGE_HEIGHT / 2 + 6} Z`}
        />
      ))}

      <path
        className={styles.feedback}
        d={`M${lastStage.centerX},${STAGE_Y + STAGE_HEIGHT} C ${lastStage.centerX},140 ${feedbackTarget.centerX},140 ${feedbackTarget.centerX},${STAGE_Y + STAGE_HEIGHT}`}
      />
      <path
        className={styles.feedbackHead}
        d={`M${feedbackTarget.centerX - 7},${STAGE_Y + STAGE_HEIGHT + 12} L${feedbackTarget.centerX},${STAGE_Y + STAGE_HEIGHT + 2} L${feedbackTarget.centerX + 7},${STAGE_Y + STAGE_HEIGHT + 12} Z`}
      />

      <EditorialFigure x={565} y={140} scale={0.55} flip />
      <rect className={styles.screen} x="546" y="150" width="20" height="14" rx="2" />
    </svg>
  );
}
