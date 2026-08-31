import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./AiHeroVisual.module.css";

const FRAGMENTS = [
  { x: 30, y: 30, w: 34, h: 20, rotate: -12, cx: 47, cy: 40 },
  { x: 90, y: 20, w: 30, h: 18, rotate: 8, cx: 105, cy: 29 },
  { x: 20, y: 90, w: 32, h: 20, rotate: 14, cx: 36, cy: 100 },
  { x: 110, y: 70, w: 28, h: 18, rotate: -6, cx: 124, cy: 79 },
  { x: 60, y: 130, w: 30, h: 18, rotate: 10, cx: 75, cy: 139 },
  { x: 140, y: 110, w: 26, h: 16, rotate: -10, cx: 153, cy: 118 },
];

const TRAIL_DOTS = [
  { cx: 190, cy: 110, r: 3, opacity: 0.4 },
  { cx: 205, cy: 125, r: 3, opacity: 0.3 },
  { cx: 218, cy: 138, r: 2.5, opacity: 0.22 },
];

/**
 * AI, Data & Automation's signature hero visual (S4, upgraded S8, rebuilt
 * S8.2) — a premium editorial "intelligence scene," replacing the earlier
 * robot + butterfly composition, which browser review found too abstract
 * and visually small to read as the site's flagship innovation moment.
 * Reads as one continuous scene, not a flowchart: loose raw-information
 * fragments drift toward a large, soft adaptive form (an organic "squircle"
 * — a light outer absorbing layer and a more solid, organized inner core,
 * with a couple of faint pattern arcs inside the core suggesting things
 * becoming organized); a clean result panel with a single resolving mark
 * emerges directly from the form's lower edge; an editorial figure stands
 * beside that result, standing for human control at the point where the
 * intelligence becomes useful. Restrained to the site's existing
 * accent/neutral palette — no neural-network imagery, no particles without
 * meaning, no literal brain or robot. Purely decorative: the same idea is
 * already stated as real text in the hero copy, so the whole graphic stays
 * aria-hidden.
 */
export function AiHeroVisual() {
  return (
    <div className={styles.panel}>
      <div className={styles.glow} aria-hidden="true" />
      <svg className={styles.svg} viewBox="0 0 480 400" aria-hidden="true">
        <rect className={styles.formShadow} x="176" y="118" width="200" height="180" rx="70" />
        <rect className={styles.formOuter} x="170" y="110" width="200" height="180" rx="70" />
        <rect className={styles.formInner} x="225" y="155" width="130" height="115" rx="52" />

        <path className={styles.pattern} d="M240,190 Q270,165 300,180" />
        <path className={styles.pattern} d="M245,220 Q280,200 315,210" />

        {FRAGMENTS.map((fragment, index) => (
          <rect
            key={index}
            className={styles.fragment}
            x={fragment.x}
            y={fragment.y}
            width={fragment.w}
            height={fragment.h}
            rx="5"
            transform={`rotate(${fragment.rotate} ${fragment.cx} ${fragment.cy})`}
          />
        ))}

        {TRAIL_DOTS.map((dot, index) => (
          <circle key={index} className={styles.trail} cx={dot.cx} cy={dot.cy} r={dot.r} opacity={dot.opacity} />
        ))}

        <rect className={styles.output} x="300" y="270" width="120" height="58" rx="12" />
        <path className={styles.checkmark} d="M320,300 L336,314 L364,284" />

        <EditorialFigure x={445} y={355} scale={0.85} />
      </svg>
    </div>
  );
}
