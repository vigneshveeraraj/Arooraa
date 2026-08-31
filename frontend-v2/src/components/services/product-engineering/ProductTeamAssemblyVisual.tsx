import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./ProductTeamAssemblyVisual.module.css";

const DOCKED_CHIPS = [
  { x: 210, y: 40, w: 40, h: 30 },
  { x: 290, y: 150, w: 40, h: 30 },
];

const ARRIVING_CHIPS = [
  { x: 340, y: 30, w: 42, h: 32, rotate: 10, cx: 361, cy: 46, echo: { x: 302, y: 69, w: 34, h: 26 } },
  { x: 60, y: 230, w: 42, h: 32, rotate: -8, cx: 81, cy: 246, echo: { x: 120, y: 199, w: 34, h: 26 } },
  { x: 60, y: 60, w: 38, h: 28, rotate: 12, cx: 79, cy: 74, echo: { x: 120, y: 90, w: 30, h: 22 } },
];

/**
 * The Business Problem section's flagship picture-story visual for Product
 * Engineering (S8/S8.1, upgraded S8.2) — a fuller "digital product
 * workshop" scene inside a bordered editorial panel, replacing the sparser
 * blueprint→arrow→product composition that read as too icon-like in the
 * browser. One central product surface has a couple of component chips
 * already docked flush against its edges, with a few more still arriving —
 * each trailing a faint motion echo of its own shape — and two editorial
 * figures at the build, one on each side. Deliberately uses one repeated
 * chip shape at varied size/rotation/distance rather than seven bespoke
 * labeled icons, so the scene reads as "many parts converging into one
 * engineered product" without turning into a labeled architecture diagram.
 * The same idea is already stated as real text in the Business Problem body
 * copy, so the whole scene stays decorative (aria-hidden).
 */
export function ProductTeamAssemblyVisual() {
  return (
    <div className={styles.panel}>
      <div className={styles.glow} aria-hidden="true" />
      <svg className={styles.svg} viewBox="0 0 480 340" aria-hidden="true">
        {ARRIVING_CHIPS.map((chip, index) => (
          <rect
            key={`echo-${index}`}
            className={styles.chipEcho}
            x={chip.echo.x}
            y={chip.echo.y}
            width={chip.echo.w}
            height={chip.echo.h}
            rx="7"
          />
        ))}

        <rect className={styles.product} x="190" y="70" width="100" height="160" rx="16" />
        <rect className={styles.surfaceAccent} x="204" y="86" width="72" height="10" rx="5" />

        {DOCKED_CHIPS.map((chip, index) => (
          <rect key={index} className={styles.chipDocked} x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx="8" />
        ))}

        {ARRIVING_CHIPS.map((chip, index) => (
          <rect
            key={index}
            className={styles.chipArriving}
            x={chip.x}
            y={chip.y}
            width={chip.w}
            height={chip.h}
            rx="8"
            transform={`rotate(${chip.rotate} ${chip.cx} ${chip.cy})`}
          />
        ))}

        <EditorialFigure x={110} y={290} scale={0.9} />
        <EditorialFigure x={430} y={290} scale={0.9} flip />
      </svg>
    </div>
  );
}
