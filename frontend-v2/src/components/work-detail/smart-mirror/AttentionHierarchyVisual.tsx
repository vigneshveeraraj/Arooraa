import type { CSSProperties } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { ATTENTION_TIERS } from "@/lib/content/work-detail/smart-mirror";
import styles from "./AttentionHierarchyVisual.module.css";

const VIEW_W = 640;
const VIEW_H = 360;

const TIER_CLASS = ["now", "soon", "available"] as const;
const TIER_POSITIONS = [
  { x: 300, y: 190 },
  { x: 445, y: 145 },
  { x: 565, y: 110 },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 8 — an attention field, not three stacked labels: a person at
 * left, with Now closest and largest, Soon further and softer, Available
 * furthest, smallest and faintest — spatial distance, scale and opacity
 * carry the hierarchy, not color alone (the tier name and description are
 * always real, visible text).
 */
export function AttentionHierarchyVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          <EditorialFigure x={110} y={320} scale={1.6} />
          {TIER_POSITIONS.map((pos, index) => (
            <line key={index} className={styles.connector} x1="150" y1="260" x2={pos.x} y2={pos.y} />
          ))}
        </svg>

        {ATTENTION_TIERS.map((tier, index) => {
          const pos = TIER_POSITIONS[index]!;
          const cls = TIER_CLASS[index] ?? "available";
          return (
            <div key={tier.name} className={`${styles.tier} ${styles[cls]}`} style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) } as CSSProperties}>
              <p className={styles.tierName}>{tier.name}</p>
              <p className={styles.tierDescription}>{tier.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
