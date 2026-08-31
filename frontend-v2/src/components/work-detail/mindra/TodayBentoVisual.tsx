import type { ComponentType } from "react";
import { FamilyIcon, GroceryIcon, MealIcon, NoteIcon, TaskIcon, TodayIcon } from "./MindraIcons";
import { TODAY_BENTO } from "@/lib/content/work-detail/mindra";
import styles from "./TodayBentoVisual.module.css";

const ICONS: ComponentType[] = [TodayIcon, TaskIcon, GroceryIcon, MealIcon, NoteIcon, FamilyIcon];

/**
 * Chapter 5 — a calm, product-like bento of what Today brings back
 * together: Today itself given the largest, featured tile, the other five
 * areas sized more modestly around it. No percentages, counts or
 * analytics of any kind — each tile states what it's for, not a number.
 */
export function TodayBentoVisual() {
  return (
    <div className={styles.bento}>
      {TODAY_BENTO.map(({ label, description }, index) => {
        const Icon = ICONS[index];
        return (
          <div key={label} className={`${styles.tile} ${index === 0 ? styles.featured : ""}`}>
            <span className={styles.tileIcon} aria-hidden="true">
              {Icon ? <Icon /> : null}
            </span>
            <p className={styles.tileLabel}>{label}</p>
            <p className={styles.tileDescription}>{description}</p>
          </div>
        );
      })}
    </div>
  );
}
