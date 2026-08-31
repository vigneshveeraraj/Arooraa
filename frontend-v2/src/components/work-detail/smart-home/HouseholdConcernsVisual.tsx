import type { ComponentType, CSSProperties } from "react";
import { HOUSEHOLD_CONCERNS } from "@/lib/content/work-detail/smart-home";
import { ACIcon, EnergyIcon, HouseIcon, LightbulbIcon, RoomIcon, RoutineIcon, SafetyIcon, WaterDropIcon, WrenchIcon } from "./SmartHomeIcons";
import styles from "./HouseholdConcernsVisual.module.css";

const VIEW_W = 680;
const VIEW_H = 420;
const HOME = { x: 540, y: 210 };

const ICONS: ComponentType[] = [LightbulbIcon, ACIcon, EnergyIcon, WaterDropIcon, WrenchIcon, SafetyIcon, RoutineIcon, RoomIcon];
const POSITIONS = [
  { x: 90, y: 80 },
  { x: 210, y: 55 },
  { x: 60, y: 190 },
  { x: 200, y: 220 },
  { x: 90, y: 320 },
  { x: 230, y: 355 },
  { x: 130, y: 140 },
  { x: 260, y: 130 },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 1 — eight scattered household concerns settle into one
 * coordinated home view, not a radial ecosystem diagram: every item
 * converges on a single house panel positioned to one side, rather than
 * radiating from a center, and no two items share the same distance from
 * it.
 */
export function HouseholdConcernsVisual() {
  return (
    <div className={styles.scene}>
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
        {POSITIONS.map((pos, index) => (
          <path key={index} className={styles.connector} d={`M ${pos.x} ${pos.y} Q ${(pos.x + HOME.x) / 2} ${(pos.y + HOME.y) / 2 - 10} ${HOME.x} ${HOME.y}`} />
        ))}
        <rect className={styles.homePanel} x={HOME.x - 90} y={HOME.y - 110} width="180" height="220" rx="20" />
      </svg>

      {HOUSEHOLD_CONCERNS.map((label, index) => {
        const Icon = ICONS[index]!;
        const pos = POSITIONS[index]!;
        return (
          <span key={label} className={styles.item} style={{ left: pct(pos.x, VIEW_W), top: pct(pos.y, VIEW_H) } as CSSProperties}>
            <span className={styles.itemIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.itemLabel}>{label}</span>
          </span>
        );
      })}

      <span className={styles.homeIcon} style={{ left: pct(HOME.x, VIEW_W), top: pct(HOME.y - 55, VIEW_H) } as CSSProperties} aria-hidden="true">
        <HouseIcon />
      </span>
      <span className={styles.homeLabel} style={{ left: pct(HOME.x, VIEW_W), top: pct(HOME.y + 15, VIEW_H) } as CSSProperties}>
        One coordinated
        <br />
        home view
      </span>
    </div>
  );
}
