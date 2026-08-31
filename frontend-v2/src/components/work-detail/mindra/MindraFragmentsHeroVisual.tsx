import type { ComponentType } from "react";
import type { CSSProperties } from "react";
import { FamilyIcon, GroceryIcon, NoteIcon, ReminderIcon, TaskIcon } from "./MindraIcons";
import styles from "./MindraFragmentsHeroVisual.module.css";

const VIEW_W = 620;
const VIEW_H = 440;

interface FragmentSpec {
  Icon: ComponentType;
  scattered: { x: number; y: number; rotation: number };
  calm: { x: number; y: number };
}

/**
 * W2.2A — reduced from eight fragment kinds to five deliberately larger
 * ones, so the hero reads as a strong composition rather than a grid of
 * tiny icons. The calm side settles into an almost-grid (four aligned
 * corners plus one centered beneath) rather than a full symmetrical
 * layout, so the last fragment visibly "settles into place."
 */
const FRAGMENTS: FragmentSpec[] = [
  { Icon: NoteIcon, scattered: { x: 95, y: 85, rotation: -13 }, calm: { x: 470, y: 120 } },
  { Icon: TaskIcon, scattered: { x: 225, y: 65, rotation: 11 }, calm: { x: 560, y: 120 } },
  { Icon: GroceryIcon, scattered: { x: 60, y: 235, rotation: 16 }, calm: { x: 470, y: 235 } },
  { Icon: FamilyIcon, scattered: { x: 235, y: 250, rotation: -17 }, calm: { x: 560, y: 235 } },
  { Icon: ReminderIcon, scattered: { x: 140, y: 385, rotation: 9 }, calm: { x: 515, y: 350 } },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * The hero visual — a native scene (no raster image, per the brief), not a
 * generic feature list: five everyday fragments appear twice — scattered,
 * rotated and muted on the left, and calm, upright and accented in a
 * settling arrangement on the right — joined by a soft flowing line each,
 * with a faint indigo wash behind the whole scene standing in for Mindra
 * as the organizing layer the fragments pass through. The hero copy
 * already states the idea in real text, so the whole scene stays
 * decorative. Chip backgrounds and connectors render as one background
 * SVG; the icons themselves are plain HTML-positioned (percentage
 * coordinates matching the SVG viewBox) so each one sizes reliably via
 * ordinary CSS instead of nested-SVG scaling.
 */
export function MindraFragmentsHeroVisual() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.glow} />
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {FRAGMENTS.map(({ scattered, calm }, index) => {
          const midX = (scattered.x + calm.x) / 2;
          return (
            <path
              key={index}
              className={styles.connector}
              d={`M ${scattered.x} ${scattered.y} Q ${midX} ${(scattered.y + calm.y) / 2} ${calm.x} ${calm.y}`}
            />
          );
        })}
        {FRAGMENTS.map(({ scattered }, index) => (
          <rect
            key={index}
            className={styles.scatteredChip}
            x={scattered.x - 32}
            y={scattered.y - 32}
            width="64"
            height="64"
            rx="18"
            transform={`rotate(${scattered.rotation} ${scattered.x} ${scattered.y})`}
          />
        ))}
        {FRAGMENTS.map(({ calm }, index) => (
          <rect key={index} className={styles.calmChip} x={calm.x - 35} y={calm.y - 35} width="70" height="70" rx="20" />
        ))}
      </svg>

      {FRAGMENTS.map(({ Icon, scattered }, index) => (
        <span
          key={`s-${index}`}
          className={styles.scatteredIcon}
          style={{ left: pct(scattered.x, VIEW_W), top: pct(scattered.y, VIEW_H) } as CSSProperties}
        >
          <Icon />
        </span>
      ))}
      {FRAGMENTS.map(({ Icon, calm }, index) => (
        <span key={`c-${index}`} className={styles.calmIcon} style={{ left: pct(calm.x, VIEW_W), top: pct(calm.y, VIEW_H) } as CSSProperties}>
          <Icon />
        </span>
      ))}
    </div>
  );
}
