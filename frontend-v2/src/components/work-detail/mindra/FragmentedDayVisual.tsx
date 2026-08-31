import type { ComponentType, CSSProperties } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { BookmarkIcon, FamilyIcon, GroceryIcon, NoteIcon, ReminderIcon, TaskIcon } from "./MindraIcons";
import { FRAGMENTED_DAY_ITEMS } from "@/lib/content/work-detail/mindra";
import styles from "./FragmentedDayVisual.module.css";

const VIEW_W = 560;
const VIEW_H = 460;

type ItemVariant = "tagRow" | "tagStack" | "tagPill" | "tagPillDot" | "badge";

const ICONS: ComponentType[] = [NoteIcon, TaskIcon, BookmarkIcon, GroceryIcon, FamilyIcon, ReminderIcon];
const VARIANTS: ItemVariant[] = ["tagRow", "tagStack", "tagPill", "tagRow", "badge", "tagPillDot"];
const POSITIONS = [
  { x: 90, y: 80 },
  { x: 460, y: 75 },
  { x: 55, y: 235 },
  { x: 480, y: 235 },
  { x: 120, y: 405 },
  { x: 440, y: 405 },
];
const ROTATIONS = [-5, 4, -8, 6, 0, 7];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 1 — one larger person, with a faint device outline behind them
 * (grounding the scene without adding a raster image), and the six kinds
 * of everyday information that make up a fragmented day scattered around
 * them at uneven distances. Each kind renders in a visually distinct
 * shape (row tag, stacked tag, pill, pill with an accent dot, circular
 * badge) rather than one repeated pill, with real gaps between each item
 * and no connecting lines — deliberately fragmented, not chaotic. The six
 * item labels are the chapter's own new content, so they render as real,
 * visible text.
 */
export function FragmentedDayVisual() {
  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
        <rect className={styles.deviceCue} x={VIEW_W / 2 - 46} y={VIEW_H / 2 - 130} width="92" height="176" rx="20" />
        <EditorialFigure x={VIEW_W / 2} y={360} scale={1.6} />
      </svg>

      {FRAGMENTED_DAY_ITEMS.map((label, index) => {
        const Icon = ICONS[index];
        const position = POSITIONS[index];
        const rotation = ROTATIONS[index] ?? 0;
        const variant = VARIANTS[index];
        if (!Icon || !position || !variant) return null;
        const style = {
          left: pct(position.x, VIEW_W),
          top: pct(position.y, VIEW_H),
          "--rotation": `${rotation}deg`,
        } as CSSProperties;

        if (variant === "badge") {
          return (
            <span key={label} className={styles.badgeItem} style={style}>
              <span className={styles.badgeCircle} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.badgeLabel}>{label}</span>
            </span>
          );
        }

        return (
          <span key={label} className={`${styles.tagItem} ${styles[variant]}`} style={style}>
            <span className={styles.tagIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.tagLabel}>{label}</span>
            {variant === "tagPillDot" ? <span className={styles.dot} aria-hidden="true" /> : null}
          </span>
        );
      })}
    </div>
  );
}
