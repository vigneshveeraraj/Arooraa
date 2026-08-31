import styles from "./ProductHealthVisual.module.css";

const STEPS = [{ height: 30 }, { height: 45 }, { height: 58 }, { height: 72 }, { height: 88 }, { height: 104 }];

const BASELINE = 160;
const BAR_WIDTH = 44;
const START_X = 30;
const GAP = 65;

/**
 * The Outcomes section's companion visual (S7, reworked S8.1) — "small
 * improvements compounding over time": six ascending accent bars (each step
 * slightly stronger than the last) connected by a rising trend line with a
 * marker at each step, continuing past the final bar as a dashed, open-
 * ended line — the trajectory keeps going, it doesn't plateau. Deliberately
 * not a dashboard readout (no axis, no numbers, no per-metric cards) to
 * avoid reading as a NOC/support-center monitoring screen; this is one
 * continuous improvement story instead of several parallel gauges. The
 * underlying idea is already stated as real text in the Outcomes list
 * itself, so this stays decorative (aria-hidden).
 */
export function ProductHealthVisual() {
  const bars = STEPS.map((step, index) => {
    const x = START_X + index * GAP;
    const y = BASELINE - step.height;
    return { x, y, height: step.height, centerX: x + BAR_WIDTH / 2, opacity: 0.35 + index * 0.11 };
  });
  const last = bars[bars.length - 1]!;
  const continuationEnd = { x: last.centerX + 53, y: last.y - 21 };

  return (
    <svg className={styles.svg} viewBox="0 0 480 180" aria-hidden="true">
      {bars.map((bar, index) => (
        <rect
          key={index}
          className={styles.step}
          x={bar.x}
          y={bar.y}
          width={BAR_WIDTH}
          height={bar.height}
          rx="3"
          opacity={bar.opacity}
        />
      ))}

      <path className={styles.trend} d={`M${bars.map((bar) => `${bar.centerX},${bar.y}`).join(" L")}`} />
      {bars.map((bar, index) => (
        <circle key={index} className={styles.marker} cx={bar.centerX} cy={bar.y} r="4" />
      ))}

      <path className={styles.continuation} d={`M${last.centerX},${last.y} L${continuationEnd.x},${continuationEnd.y}`} />
      <circle className={styles.openEnd} cx={continuationEnd.x} cy={continuationEnd.y} r="5" />
    </svg>
  );
}
