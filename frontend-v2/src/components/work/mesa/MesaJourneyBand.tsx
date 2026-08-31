import type { CSSProperties } from "react";
import styles from "./MesaJourneyBand.module.css";

const JOURNEY_STEPS = ["Guest", "Operations", "Kitchen", "Billing"];

/**
 * The second horizontal band under MESA's flagship story (W1 §9, enlarged
 * and staggered W1.1) — four editorial labels, not feature cards, standing
 * in for the moments a restaurant experience actually moves through. Each
 * step indents further than the last (a staggered "staircase" reading down
 * and to the right) rather than sitting in one small centered row, so the
 * band reads as a bigger, more deliberate transition into the next story.
 * The indent step shrinks on narrow screens instead of disappearing, so the
 * staggered rhythm survives without ever pushing text off-screen.
 */
export function MesaJourneyBand() {
  return (
    <ol className={styles.band} aria-label="The MESA restaurant journey">
      {JOURNEY_STEPS.map((step, index) => (
        <li key={step} className={styles.step} style={{ "--step-index": index } as CSSProperties}>
          {index > 0 ? (
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          ) : null}
          <span className={styles.label}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
