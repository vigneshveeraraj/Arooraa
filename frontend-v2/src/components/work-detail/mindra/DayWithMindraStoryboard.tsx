import type { ComponentType } from "react";
import { FamilyIcon, GroceryIcon, MealIcon, NoteIcon, TaskIcon, TodayIcon } from "./MindraIcons";
import { DAY_MOMENTS } from "@/lib/content/work-detail/mindra";
import styles from "./DayWithMindraStoryboard.module.css";

const ICONS: ComponentType[] = [TodayIcon, NoteIcon, GroceryIcon, FamilyIcon, MealIcon, TaskIcon];
const ACCENTS = ["accentIndigo", "accentLavender", "accentGreen", "accentAmber", "accentGreen", "accentIndigo"] as const;

/**
 * Chapter 6 — Mindra's editorial equivalent of a "day in the life"
 * storyboard: six moment cards (visual cue on top, time badge, label and
 * one sentence beneath), arranged 3×2 on desktop and stacked
 * single-column on mobile through one responsive grid rather than two
 * separate layouts. Each card carries a restrained, distinct accent tint
 * (indigo / lavender / green / amber) so the sequence reads with subtle
 * rhythm, but the moment is always identified by its real label and
 * description text, never by color alone.
 */
export function DayWithMindraStoryboard() {
  return (
    <ol className={styles.grid} aria-label="A day with Mindra">
      {DAY_MOMENTS.map((moment, index) => {
        const Icon = ICONS[index] ?? TodayIcon;
        const accent = ACCENTS[index] ?? "accentIndigo";
        return (
          <li key={`${moment.time}-${moment.label}`} className={styles.card}>
            <div className={`${styles.cue} ${styles[accent]}`}>
              <span className={styles.cueIcon} aria-hidden="true">
                <Icon />
              </span>
            </div>
            <div className={styles.body}>
              <span className={styles.time}>{moment.time}</span>
              <p className={styles.label}>{moment.label}</p>
              <p className={styles.description}>{moment.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
