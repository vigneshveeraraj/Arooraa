import type { CSSProperties } from "react";
import { PROTOTYPE_FUTURE_ITEMS, PROTOTYPE_FUTURE_LABEL, PROTOTYPE_NOW_ITEMS, PROTOTYPE_NOW_LABEL } from "@/lib/content/work-detail/smart-mirror";
import styles from "./PrototypeVsFutureVisual.module.css";

const VIEW_W = 700;
const VIEW_H = 460;
const CENTER = { x: VIEW_W / 2, y: VIEW_H / 2 };
const RADIUS = { x: 300, y: 190 };

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

const FUTURE_POSITIONS = PROTOTYPE_FUTURE_ITEMS.map((_, index) => {
  const angle = (index / PROTOTYPE_FUTURE_ITEMS.length) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER.x + Math.cos(angle) * RADIUS.x,
    y: CENTER.y + Math.sin(angle) * RADIUS.y,
  };
});

function CoreBlock({ className }: { className: string }) {
  return (
    <div className={className}>
      <p className={styles.coreLabel}>{PROTOTYPE_NOW_LABEL}</p>
      <ul className={styles.coreItems}>
        {PROTOTYPE_NOW_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Chapter 14 — not a two-column chip list on desktop: a solid central
 * prototype core with the nine future application directions extending
 * outward on faint radiating lines, dashed and muted, at real distance
 * from the core. Below ~768px the radial form would crowd nine
 * variable-length labels into too little space, so a second, genuinely
 * different mobile layout takes over instead of shrinking the radial
 * diagram until labels collide: the same solid core block, followed by a
 * clean two-column future-direction list with a connecting dashed line —
 * same conceptual meaning, CSS-toggled between the two (only one is ever
 * visible/exposed to assistive tech at a given viewport, since the other
 * is `display: none`).
 */
export function PrototypeVsFutureVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.desktopLayout}>
        <div className={styles.canvas}>
          <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
            {FUTURE_POSITIONS.map((pos, index) => (
              <line key={index} className={styles.connector} x1={CENTER.x} y1={CENTER.y} x2={pos.x} y2={pos.y} />
            ))}
          </svg>

          <CoreBlock className={styles.core!} />

          {PROTOTYPE_FUTURE_ITEMS.map((item, index) => {
            const pos = FUTURE_POSITIONS[index]!;
            return (
              <span key={item} className={styles.futureChip} style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) } as CSSProperties}>
                {item}
              </span>
            );
          })}
        </div>

        <p className={styles.futureLabel}>{PROTOTYPE_FUTURE_LABEL}</p>
      </div>

      <div className={styles.mobileLayout}>
        <CoreBlock className={styles.mobileCore!} />
        <span className={styles.mobileConnector} aria-hidden="true" />
        <p className={styles.futureLabel}>{PROTOTYPE_FUTURE_LABEL}</p>
        <ul className={styles.mobileFutureList}>
          {PROTOTYPE_FUTURE_ITEMS.map((item) => (
            <li key={item} className={styles.mobileFutureItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
