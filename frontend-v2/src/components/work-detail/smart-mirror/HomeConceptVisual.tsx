import type { ComponentType } from "react";
import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import { HOME_CONCEPT_ITEMS, HOME_CONCEPT_LABEL, MORNING_MOMENTS } from "@/lib/content/work-detail/smart-mirror";
import { CalendarIcon, ClockIcon, FamilyIcon } from "./SmartMirrorIcons";
import styles from "./HomeConceptVisual.module.css";

const VIEW_W = 220;
const VIEW_H = 260;

// Content density accumulates from Start (empty) to Prepare (two cues) then
// recedes to Leave (one cue) — a routine unfolding, not a static chip cluster.
const MOMENT_ICONS: ComponentType[][] = [[], [ClockIcon, CalendarIcon], [FamilyIcon]];

/**
 * Chapter 3 — the one supplied home scene appears in the hero, so this
 * chapter tells its part of the story natively: a three-moment editorial
 * sequence (Start → Prepare → Leave), each with its own small person +
 * mirror scene and changing content density, followed by the full list of
 * home experience-concept items as real, visible chips.
 */
export function HomeConceptVisual() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.conceptBadge}>{HOME_CONCEPT_LABEL}</span>

      <ol className={styles.moments}>
        {MORNING_MOMENTS.map((moment, index) => {
          const icons = MOMENT_ICONS[index] ?? [];
          return (
            <li key={moment.name} className={styles.moment}>
              <div className={styles.scene}>
                <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
                  <rect className={styles.mirror} x="118" y="30" width="80" height="150" rx="16" />
                  <EditorialFigure x={75} y={235} scale={1.5} />
                </svg>
                <span className={styles.cues} aria-hidden="true">
                  {icons.map((Icon, cueIndex) => (
                    <span key={cueIndex} className={styles.cue}>
                      <Icon />
                    </span>
                  ))}
                </span>
              </div>
              <p className={styles.momentName}>{moment.name}</p>
              <p className={styles.momentDescription}>{moment.description}</p>
            </li>
          );
        })}
      </ol>

      <ul className={styles.items}>
        {HOME_CONCEPT_ITEMS.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
