import type { CSSProperties } from "react";
import { TRUST_PRINCIPLES } from "@/lib/content/work-detail/mindra";
import styles from "./PrivateToSharedVisual.module.css";

const VIEW_W = 560;
const VIEW_H = 260;

const PRIVATE_CARDS = [
  { x: 90, y: 90 },
  { x: 160, y: 130 },
  { x: 90, y: 170 },
];
const CROSSING_CARD = { x: 200, y: 130 };
const SHARED_CARD = { x: 460, y: 130 };

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 9 — "Private by default, deliberate share, Family Space" without
 * a giant shield or padlock: a private boundary holding several personal
 * cards, with exactly one card shown mid-crossing into a separate Family
 * Space boundary, joined by a single dashed path. Everything else stays
 * inside the private boundary. The six trust principles render as real
 * text beneath. This is the page's one dark section.
 */
export function PrivateToSharedVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          <rect className={styles.privateBoundary} x="30" y="40" width="220" height="180" rx="24" strokeDasharray="4 6" />
          <rect className={styles.sharedBoundary} x="380" y="70" width="150" height="120" rx="20" />
          <path
            className={styles.crossingPath}
            d={`M ${CROSSING_CARD.x} ${CROSSING_CARD.y} C ${(CROSSING_CARD.x + SHARED_CARD.x) / 2} ${CROSSING_CARD.y - 30}, ${
              (CROSSING_CARD.x + SHARED_CARD.x) / 2
            } ${SHARED_CARD.y + 30}, ${SHARED_CARD.x} ${SHARED_CARD.y}`}
          />
          {PRIVATE_CARDS.map((card, index) => (
            <rect key={index} className={styles.privateCard} x={card.x - 20} y={card.y - 15} width="40" height="30" rx="6" />
          ))}
          <rect className={styles.crossingCard} x={CROSSING_CARD.x - 20} y={CROSSING_CARD.y - 15} width="40" height="30" rx="6" />
          <rect className={styles.sharedCard} x={SHARED_CARD.x - 20} y={SHARED_CARD.y - 15} width="40" height="30" rx="6" />
        </svg>

        <span className={styles.boundaryLabel} style={{ left: pct(140, VIEW_W), top: pct(30, VIEW_H) } as CSSProperties}>
          My Space
        </span>
        <span className={styles.boundaryLabel} style={{ left: pct(455, VIEW_W), top: pct(58, VIEW_H) } as CSSProperties}>
          Family Space
        </span>
      </div>

      <ul className={styles.principles} aria-label="How Mindra earns trust">
        {TRUST_PRINCIPLES.map((principle) => (
          <li key={principle} className={styles.principle}>
            {principle}
          </li>
        ))}
      </ul>
    </div>
  );
}
