import { FOUNDER_LED } from "@/lib/content/about";
import { AboutSpark } from "./AboutSpark";
import styles from "./FounderThinkingWallVisual.module.css";

const VIEW_W = 640;
const VIEW_H = 380;
const NOTE_ANCHORS = [
  { x: 120, y: 80 },
  { x: 400, y: 55 },
  { x: 140, y: 270 },
  { x: 410, y: 290 },
];
const CONVERGE = { x: 540, y: 175 };

const NOTE_ROTATION = ["-2.5deg", "2deg", "3deg", "-2deg"];
const NOTE_POSITION = [
  { left: "6%", top: "10%" },
  { left: "52%", top: "4%" },
  { left: "8%", top: "60%" },
  { left: "54%", top: "66%" },
];

/**
 * Chapter 10's "thinking wall" scene (W3.1 §17) — real, senior product
 * questions scattered like sticky notes, converging on one clean, solid
 * product shape. Notes are real HTML text (slightly rotated via CSS, not a
 * novelty handwriting font); the connecting lines and product shape are a
 * decorative SVG layer behind them.
 */
export function FounderThinkingWallVisual() {
  return (
    <div className={styles.frame}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" className={styles.scene}>
        {NOTE_ANCHORS.map((anchor, index) => (
          <path
            key={index}
            d={`M ${anchor.x} ${anchor.y} Q ${(anchor.x + CONVERGE.x) / 2} ${anchor.y}, ${CONVERGE.x - 30} ${CONVERGE.y}`}
            className={styles.thread}
          />
        ))}
        <circle cx={CONVERGE.x} cy={CONVERGE.y} r="70" className={styles.glow} />
        <rect x={CONVERGE.x - 55} y={CONVERGE.y - 42} width="110" height="84" rx="14" className={styles.product} />
      </svg>

      {FOUNDER_LED.wallNotes.map((note, index) => (
        <span
          key={note}
          className={styles.note}
          style={{ ...NOTE_POSITION[index], transform: `rotate(${NOTE_ROTATION[index]})` }}
        >
          {note}
        </span>
      ))}

      <span
        className={styles.sparkWrap}
        style={{ left: `${(CONVERGE.x / VIEW_W) * 100}%`, top: `${(CONVERGE.y / VIEW_H) * 100}%` }}
      >
        <AboutSpark size={22} />
      </span>
    </div>
  );
}
