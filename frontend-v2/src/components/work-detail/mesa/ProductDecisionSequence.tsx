import { Fragment } from "react";
import { PRODUCT_DECISIONS } from "@/lib/content/work-detail/mesa";
import { CallWaiterIcon, MenuIcon, OrderIcon, QrIcon } from "./JourneyIcons";
import styles from "./ProductDecisionSequence.module.css";

const GUEST_CONTROL_ICONS = [QrIcon, MenuIcon, OrderIcon, CallWaiterIcon];

const DOT_SETS = [
  [
    { x: 20, y: 10 },
    { x: 55, y: 22 },
    { x: 38, y: 42 },
  ],
  [
    { x: 20, y: 17 },
    { x: 54, y: 26 },
    { x: 49, y: 41 },
  ],
  [
    { x: 20, y: 24 },
    { x: 53, y: 30 },
    { x: 59, y: 40 },
  ],
  [
    { x: 20, y: 31 },
    { x: 51, y: 34 },
    { x: 70, y: 39 },
  ],
  [
    { x: 20, y: 38 },
    { x: 50, y: 38 },
    { x: 80, y: 38 },
  ],
];

const TABLE_OPACITY = [0.3, 0.5, 0.65, 0.8, 1];
const TABLE_STROKE = [1, 1.5, 2, 2.5, 3];

function FrameScene({ index }: { index: number }) {
  const dots = DOT_SETS[index] ?? DOT_SETS[0]!;
  const opacity = TABLE_OPACITY[index] ?? 1;
  const strokeWidth = TABLE_STROKE[index] ?? 3;
  return (
    <svg className={styles.icon} viewBox="0 0 100 60" aria-hidden="true">
      <ellipse className={styles.table} cx="50" cy="38" rx="38" ry="12" style={{ opacity, strokeWidth }} />
      {dots.map((dot, dotIndex) => (
        <circle key={dotIndex} className={styles.dot} cx={dot.x} cy={dot.y} r="4" />
      ))}
    </svg>
  );
}

/**
 * Chapter 5 (rebuilt W2.1.1) — instead of five independent tiny glyphs, one
 * shared table scene repeats across all five frames, becoming progressively
 * more resolved: fainter and thinner at Decision 01, solid and confident by
 * Decision 05, while three loose marks drift from scattered into one clean
 * aligned row. The product visibly becomes clearer across the sequence. All
 * five approved decision titles/descriptions stay real text, unchanged.
 */
export function ProductDecisionSequence() {
  return (
    <div className={styles.sequence}>
      {PRODUCT_DECISIONS.map((decision, index) => (
        <Fragment key={decision.number}>
          {index > 0 ? (
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          ) : null}
          <div className={styles.frame}>
            <FrameScene index={index} />
            <p className={styles.number}>Decision {decision.number}</p>
            <p className={`text-h4 ${styles.title}`}>{decision.title}</p>
            <p className={`text-body-sm ${styles.description}`}>{decision.description}</p>
            {decision.number === "02" ? (
              <span className={styles.guestControlIcons} aria-hidden="true">
                {GUEST_CONTROL_ICONS.map((Icon, iconIndex) => (
                  <Icon key={iconIndex} />
                ))}
              </span>
            ) : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
