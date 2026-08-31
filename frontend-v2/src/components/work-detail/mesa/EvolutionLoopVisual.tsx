import { EVOLUTION_STEPS } from "@/lib/content/work-detail/mesa";
import styles from "./EvolutionLoopVisual.module.css";

const POSITIONS = [
  { x: 50, y: 12 },
  { x: 82.9, y: 31 },
  { x: 82.9, y: 69 },
  { x: 50, y: 88 },
  { x: 17.1, y: 69 },
  { x: 17.1, y: 31 },
];

const DOT_SIZES = [6, 8, 10, 12, 14, 16];

/**
 * Chapter 11's evolution loop — Idea → Build → Test → Observe → Correct →
 * Expand arranged around a dashed ring, with the marker at each step
 * growing larger than the last (small at Idea, largest at Expand) so the
 * loop itself suggests increasing product maturity, not just a repeating
 * cycle. One faint curved path loops back from Expand to Idea. Percentage-
 * based positioning, so it stays fluid at any width.
 */
export function EvolutionLoopVisual() {
  return (
    <div className={styles.wheel}>
      <div className={styles.ring} aria-hidden="true" />
      <svg className={styles.loopBack} viewBox="0 0 100 100" aria-hidden="true">
        <path className={styles.loopPath} d="M17.1,31 Q5,10 50,12" />
      </svg>
      {EVOLUTION_STEPS.map((step, index) => {
        const pos = POSITIONS[index] ?? { x: 50, y: 50 };
        const size = DOT_SIZES[index] ?? 8;
        return (
          <div key={step} className={styles.step} style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <span className={styles.dot} style={{ width: size, height: size }} aria-hidden="true" />
            <span className={styles.label}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
