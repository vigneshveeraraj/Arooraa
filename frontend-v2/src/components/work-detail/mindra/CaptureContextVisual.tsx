import type { ComponentType, CSSProperties } from "react";
import { BookmarkIcon, NoteIcon, TaskIcon } from "./MindraIcons";
import { CAPTURE_STAGES } from "@/lib/content/work-detail/mindra";
import styles from "./CaptureContextVisual.module.css";

const VIEW_W = 720;
const VIEW_H = 220;
const ZONE_W = VIEW_W / 3;
const ICONS: ComponentType[] = [NoteIcon, TaskIcon, BookmarkIcon];

// Three cards per zone, positioned relative to each zone's own center x.
const ZONE_CARD_OFFSETS = [
  // Capture — loose, rotated, blank (no identity yet)
  [
    { dx: -46, y: 78, rotation: -16 },
    { dx: 40, y: 60, rotation: 12 },
    { dx: -6, y: 145, rotation: -7 },
  ],
  // Organize — upright, gains an identity (icon), gridded
  [
    { dx: -46, y: 78, rotation: 0 },
    { dx: 46, y: 78, rotation: 0 },
    { dx: 0, y: 150, rotation: 0 },
  ],
  // Return when useful — consolidated into one resurfaced, accented stack
  [
    { dx: -10, y: 100, rotation: -4 },
    { dx: 2, y: 108, rotation: 2 },
    { dx: 14, y: 116, rotation: -2 },
  ],
] as const;

function pct(value: number, of: number) {
  return `${(value / of) * 100}%`;
}

/**
 * Chapter 2 — not a normal boxes-and-arrows process diagram: one continuous
 * canvas divided into three loose zones, so the same three kinds of
 * captured things (icon-less at first) visibly change state as the eye
 * moves across the scene — loose and rotated at "Capture", upright and
 * identified at "Organize", and consolidated into one accented, resurfaced
 * stack at "Return When Useful". Progress reads through increasing order
 * across one shared canvas, not connector arrows or separate boxes. Card
 * backgrounds are one decorative background SVG; icons are separate
 * HTML-positioned overlays (percentage coordinates matching the SVG
 * viewBox) so each icon sizes reliably via ordinary CSS rather than
 * nested-SVG percentage scaling.
 */
export function CaptureContextVisual() {
  return (
    <div className={styles.scene}>
      <div className={styles.canvas}>
        <svg className={styles.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" data-testid="capture-frame-scene">
          {CAPTURE_STAGES.map((stage, stageIndex) => {
            const zoneCenterX = ZONE_W * stageIndex + ZONE_W / 2;
            const cards = ZONE_CARD_OFFSETS[stageIndex] ?? ZONE_CARD_OFFSETS[0];
            const showIcon = stageIndex >= 1;
            const emphasized = stageIndex === 2;
            return (
              <g key={stage}>
                {cards.map((card, index) => {
                  const x = zoneCenterX + card.dx;
                  return (
                    <rect
                      key={index}
                      className={emphasized ? styles.cardAccent : showIcon ? styles.cardOrganized : styles.cardLoose}
                      x={x - 26}
                      y={card.y - 20}
                      width="52"
                      height="40"
                      rx="8"
                      transform={`rotate(${card.rotation} ${x} ${card.y})`}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {CAPTURE_STAGES.map((stage, stageIndex) => {
          const zoneCenterX = ZONE_W * stageIndex + ZONE_W / 2;
          const cards = ZONE_CARD_OFFSETS[stageIndex] ?? ZONE_CARD_OFFSETS[0];
          const showIcon = stageIndex >= 1;
          return showIcon
            ? cards.map((card, index) => {
                const Icon = ICONS[index];
                if (!Icon) return null;
                const x = zoneCenterX + card.dx;
                return (
                  <span
                    key={`${stage}-${index}`}
                    className={styles.cardIcon}
                    style={{ left: pct(x, VIEW_W), top: pct(card.y, VIEW_H) } as CSSProperties}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                );
              })
            : null;
        })}
      </div>

      <div className={styles.labels}>
        {CAPTURE_STAGES.map((stage) => (
          <p key={stage} className={styles.label}>
            {stage}
          </p>
        ))}
      </div>
    </div>
  );
}
