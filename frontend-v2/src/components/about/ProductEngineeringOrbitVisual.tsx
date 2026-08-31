import { PRODUCT_AND_ENGINEERING } from "@/lib/content/about";
import styles from "./ProductEngineeringOrbitVisual.module.css";

const VIEW_W = 640;
const VIEW_H = 420;
const CENTER = { x: 320, y: 210 };

// Hand-placed, irregular positions (W3.1 §12) — deliberately not an even
// radial wheel: each concern sits at its own distance and angle from "The
// Product", like a scattered network rather than spokes on a hub.
const POSITIONS = [
  { x: 90, y: 100 },
  { x: 260, y: 40 },
  { x: 480, y: 70 },
  { x: 580, y: 190 },
  { x: 540, y: 330 },
  { x: 340, y: 392 },
  { x: 150, y: 370 },
  { x: 60, y: 250 },
  { x: 205, y: 175 },
];

export function ProductEngineeringOrbitVisual() {
  return (
    <div className={styles.frame}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" className={styles.scene}>
        {POSITIONS.map((point, index) => (
          <line
            key={index}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={point.x}
            y2={point.y}
            className={styles.link}
          />
        ))}
        <circle cx={CENTER.x} cy={CENTER.y} r="46" className={styles.centerGlow} />
        <circle cx={CENTER.x} cy={CENTER.y} r="30" className={styles.centerNode} />
      </svg>

      <span
        className={`text-label ${styles.center}`}
        style={{ left: `${(CENTER.x / VIEW_W) * 100}%`, top: `${(CENTER.y / VIEW_H) * 100}%` }}
      >
        {PRODUCT_AND_ENGINEERING.centerLabel}
      </span>

      {PRODUCT_AND_ENGINEERING.concerns.map((concern, index) => {
        const point = POSITIONS[index]!;
        return (
          <span
            key={concern}
            className={`text-label ${styles.concern}`}
            style={{ left: `${(point.x / VIEW_W) * 100}%`, top: `${(point.y / VIEW_H) * 100}%` }}
          >
            {concern}
          </span>
        );
      })}
    </div>
  );
}
