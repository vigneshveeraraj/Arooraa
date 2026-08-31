import type { ComponentType, CSSProperties } from "react";
import { BookmarkIcon, ContactIcon, NoteIcon, TaskIcon, VoiceIcon } from "./MindraIcons";
import { CAPTURE_TYPES, FUTURE_CAPTURE_ITEM, FUTURE_CAPTURE_LABEL, PERSONAL_WORK_EXAMPLES } from "@/lib/content/work-detail/mindra";
import styles from "./NaturalCaptureVisual.module.css";

const VIEW_W = 560;
const VIEW_H = 380;
const SURFACE = { x: 205, y: 90, width: 150, height: 200 };
const ICONS: ComponentType[] = [NoteIcon, TaskIcon, BookmarkIcon, ContactIcon];
const POSITIONS = [
  { x: 100, y: 65 },
  { x: 460, y: 65 },
  { x: 100, y: 315 },
  { x: 460, y: 315 },
];
const DOCK_POINTS = [
  { x: SURFACE.x, y: SURFACE.y },
  { x: SURFACE.x + SURFACE.width, y: SURFACE.y },
  { x: SURFACE.x, y: SURFACE.y + SURFACE.height },
  { x: SURFACE.x + SURFACE.width, y: SURFACE.y + SURFACE.height },
];

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 4 — a larger, more substantial Mindra surface (with a small
 * accent mark and faint content bars, so it reads as a real product
 * screen rather than an empty box) receiving the four current capture
 * types from each corner, each connector "docking" at the surface edge
 * with a small accent point rather than converging on a bare center — a
 * polished editorial composition, not a literal diagram. Personal-work
 * examples render as a plain tag list beneath (this is personal work and
 * personal life, not enterprise work-management). Voice capture is
 * visually and textually separated as "Future direction" — a dashed,
 * muted chip, never mixed into the four current types.
 */
export function NaturalCaptureVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scene}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
          {POSITIONS.map((position, index) => {
            const dock = DOCK_POINTS[index]!;
            return <line key={index} className={styles.connector} x1={dock.x} y1={dock.y} x2={position.x} y2={position.y} />;
          })}
          <rect className={styles.surface} x={SURFACE.x} y={SURFACE.y} width={SURFACE.width} height={SURFACE.height} rx="26" />
          <circle className={styles.surfaceMark} cx={SURFACE.x + SURFACE.width / 2} cy={SURFACE.y + 46} r="12" />
          <rect className={styles.surfaceBar} x={SURFACE.x + 28} y={SURFACE.y + 90} width={SURFACE.width - 56} height="10" rx="5" />
          <rect className={styles.surfaceBar} x={SURFACE.x + 28} y={SURFACE.y + 112} width={SURFACE.width - 76} height="10" rx="5" />
          <rect className={styles.surfaceBar} x={SURFACE.x + 28} y={SURFACE.y + 134} width={SURFACE.width - 96} height="10" rx="5" />
          {DOCK_POINTS.map((dock, index) => (
            <circle key={index} className={styles.dockPoint} cx={dock.x} cy={dock.y} r="4.5" />
          ))}
        </svg>

        {CAPTURE_TYPES.map((label, index) => {
          const Icon = ICONS[index];
          const position = POSITIONS[index];
          if (!Icon || !position) return null;
          return (
            <span key={label} className={styles.chip} style={{ left: pct(position.x, VIEW_W), top: pct(position.y, VIEW_H) } as CSSProperties}>
              <span className={styles.chipIcon} aria-hidden="true">
                <Icon />
              </span>
              <span>{label}</span>
            </span>
          );
        })}
      </div>

      <ul className={styles.personalWork} aria-label="Examples of personal work Mindra captures">
        {PERSONAL_WORK_EXAMPLES.map((item) => (
          <li key={item} className={styles.personalWorkItem}>
            {item}
          </li>
        ))}
      </ul>

      <div className={styles.futureChip}>
        <span className={styles.futureBadge}>{FUTURE_CAPTURE_LABEL}</span>
        <span className={styles.futureIcon} aria-hidden="true">
          <VoiceIcon />
        </span>
        <span>{FUTURE_CAPTURE_ITEM}</span>
      </div>
    </div>
  );
}
