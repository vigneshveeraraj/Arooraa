import { Fragment } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./DiscoveryDirectionVisual.module.css";

const ORIGIN = { x: 60, y: 130 };

const BRANCHES = [
  { end: { x: 210, y: 42 }, control: 135 },
  { end: { x: 224, y: 96 }, control: 142 },
  { end: { x: 224, y: 166 }, control: 142 },
  { end: { x: 210, y: 220 }, control: 135 },
];

const DESTINATION = { x: 410, y: 130 };

/**
 * The Business Problem section's picture-story visual for Product Strategy
 * & Discovery (S8.1) — a branching-paths scene: several faint, dashed
 * possible directions fan out from one starting point and dead-end, while
 * one path is drawn solid and continues on to a single marked destination,
 * with an editorial figure standing at that destination. Illustrates
 * "several possible routes narrowing to one validated direction" as a
 * picture, replacing S8's scattered/aligned card composition with a more
 * specific spatial metaphor for strategic decision-making. The same idea is
 * already stated as real text in the Business Problem body copy, so the
 * whole scene stays decorative (aria-hidden).
 */
export function DiscoveryDirectionVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 480 260" aria-hidden="true">
      {BRANCHES.map((branch, index) => (
        <Fragment key={index}>
          <path
            className={styles.branch}
            d={`M${ORIGIN.x},${ORIGIN.y} Q${branch.control},${ORIGIN.y} ${branch.end.x},${branch.end.y}`}
          />
          <circle className={styles.deadEnd} cx={branch.end.x} cy={branch.end.y} r="5" />
        </Fragment>
      ))}

      <path className={styles.chosen} d="M60,130 Q235,105 410,130" />
      <circle className={styles.origin} cx={ORIGIN.x} cy={ORIGIN.y} r="7" />

      <line className={styles.pole} x1={DESTINATION.x} y1="96" x2={DESTINATION.x} y2="128" />
      <path className={styles.pennant} d={`M${DESTINATION.x},96 L${DESTINATION.x + 24},106 L${DESTINATION.x},116 Z`} />
      <circle className={styles.base} cx={DESTINATION.x} cy="128" r="4" />

      <EditorialFigure x={440} y={205} scale={0.95} />
    </svg>
  );
}
