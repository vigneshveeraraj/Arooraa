import type { ComponentType, CSSProperties } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { FamilyIcon, NoteIcon, PlanIcon, ReminderIcon, SearchIcon, TaskIcon } from "./MindraIcons";
import { CLOSING_PRINCIPLE, ORBIT_ITEMS } from "@/lib/content/work-detail/mindra";
import styles from "./MindraOrbitClosingVisual.module.css";

const VIEW_W = 480;
const VIEW_H = 400;
const ICONS: ComponentType[] = [NoteIcon, TaskIcon, PlanIcon, FamilyIcon, ReminderIcon, SearchIcon];
const ORBIT_POSITIONS = [
  { x: 240, y: 40 },
  { x: 378.6, y: 120 },
  { x: 378.6, y: 280 },
  { x: 240, y: 360 },
  { x: 101.4, y: 280 },
  { x: 101.4, y: 120 },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * The closing visual — a restrained, human-centered orbit, deliberately
 * echoing (not copying) the Our Work index card's own Mindra motif: the
 * person stays the largest, most solid shape at the center; the six
 * closing concepts sit lightly around them on a faint ring, small enough
 * that Mindra supports the scene rather than dominating it. No glowing
 * brain, no dashboard.
 */
export function MindraOrbitClosingVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          <circle className={styles.ring} cx={VIEW_W / 2} cy={200} r="150" />
          <EditorialFigure x={VIEW_W / 2} y={280} scale={1.6} />
        </svg>

        {ORBIT_ITEMS.map((label, index) => {
          const Icon = ICONS[index];
          const position = ORBIT_POSITIONS[index];
          if (!Icon || !position) return null;
          return (
            <span key={label} className={styles.item} style={{ left: pct(position.x, VIEW_W), top: pct(position.y, VIEW_H) } as CSSProperties}>
              <span className={styles.itemIcon} aria-hidden="true">
                <Icon />
              </span>
              <span>{label}</span>
            </span>
          );
        })}
      </div>

      <p className={styles.principle}>{CLOSING_PRINCIPLE}</p>
    </div>
  );
}
