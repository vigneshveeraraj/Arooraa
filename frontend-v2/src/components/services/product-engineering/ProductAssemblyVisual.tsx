import styles from "./ProductAssemblyVisual.module.css";

const LAYER_COUNT = 8;
const BAR_X = 20;
const BAR_WIDTH = 150;
const BAR_HEIGHT = 12;
const BAR_GAP = 24;
const TARGET = { x: 396, y: 106 };

/**
 * The Outcomes section's companion visual (S3) — the signature "product
 * assembly" motif: eight thin blueprint-style layer bars (one per
 * capability area — Experience, Architecture, Backend, Frontend/Mobile,
 * Data, Security, Quality, Cloud + Delivery, in that order) converging into
 * a single solid block on the right. Deliberately unlabeled and abstract —
 * not an architecture diagram — since the same eight areas are already
 * named as real text in the Capabilities section immediately below, so
 * this stays decorative (aria-hidden). Precision/assembly language, not the
 * robot + butterfly motif reserved for AI, Data & Automation.
 */
export function ProductAssemblyVisual() {
  const bars = Array.from({ length: LAYER_COUNT }, (_, index) => {
    const y = 16 + index * BAR_GAP;
    return { y, centerY: y + BAR_HEIGHT / 2 };
  });

  return (
    <svg className={styles.svg} viewBox="0 0 480 220" aria-hidden="true">
      {bars.map((bar, index) => (
        <rect
          key={index}
          className={styles.bar}
          x={BAR_X}
          y={bar.y}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          rx="3"
        />
      ))}
      {bars.map((bar, index) => (
        <line
          key={index}
          className={styles.link}
          x1={BAR_X + BAR_WIDTH}
          y1={bar.centerY}
          x2={TARGET.x}
          y2={TARGET.y}
        />
      ))}
      <rect className={styles.product} x={TARGET.x} y={TARGET.y - 28} width="60" height="56" rx="10" />
      <circle className={styles.core} cx={TARGET.x + 30} cy={TARGET.y} r="6" />
    </svg>
  );
}
