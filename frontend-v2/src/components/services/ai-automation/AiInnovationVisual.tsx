import styles from "./AiInnovationVisual.module.css";

const BLOCKS = [
  { x: 22, y: 62, size: 36, rx: 2, rotate: 0, cx: 40, cy: 80, tone: "rigid" as const },
  { x: 93, y: 63, size: 34, rx: 6, rotate: 6, cx: 110, cy: 80, tone: "rigid" as const },
  { x: 162, y: 62, size: 32, rx: 12, rotate: 14, cx: 178, cy: 78, tone: "transition" as const },
  { x: 229, y: 61, size: 30, rx: 20, rotate: 22, cx: 244, cy: 76, tone: "soft" as const },
  { x: 293, y: 61, size: 26, rx: 26, rotate: 30, cx: 306, cy: 74, tone: "soft" as const },
];

/**
 * The "Where Engineering Meets Imagination" section's companion visual (S4)
 * — the site's second, smaller use of the innovation motif: a row of five
 * squares whose corners soften and rotate more as they move left to right,
 * flowing into two small wing-fragment shapes (not a full butterfly —
 * deliberately not repeating the hero's mascot). Meant to read as
 * "structured systems becoming more adaptive," matching the section's own
 * body copy. Purely decorative and aria-hidden, same reasoning as
 * AiHeroVisual.
 */
export function AiInnovationVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 480 160" aria-hidden="true">
      {BLOCKS.map((block, index) => (
        <rect
          key={index}
          className={styles[block.tone]}
          x={block.x}
          y={block.y}
          width={block.size}
          height={block.size}
          rx={block.rx}
          transform={`rotate(${block.rotate} ${block.cx} ${block.cy})`}
        />
      ))}

      <path className={styles.connector} d="M40,80 C110,55 178,95 244,70 C290,55 330,75 366,78" />

      <path className={styles.fragmentA} d="M366,80 C356,58 332,54 316,68 C328,88 350,90 366,80 Z" />
      <path className={styles.fragmentB} d="M366,80 C376,58 400,54 416,68 C404,88 382,90 366,80 Z" />
    </svg>
  );
}
