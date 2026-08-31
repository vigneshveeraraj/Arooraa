import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./MindraWorkVisual.module.css";

const INNER_DOTS = [
  { cx: 290, cy: 260 },
  { cx: 190, cy: 260 },
  { cx: 190, cy: 161 },
  { cx: 290, cy: 161 },
];

const OUTER_DOTS = [
  { cx: 360, cy: 210 },
  { cx: 240, cy: 90 },
  { cx: 120, cy: 210 },
  { cx: 240, cy: 330 },
];

/**
 * Mindra's calm, personal visual story (W1) — a second brain around
 * everyday life, not another productivity dashboard: one editorial figure
 * at the center, with everyday information orbiting around them on two
 * rings. "My Space" and "Family Space" are told apart by shape, not just
 * color — the inner ring's four points are hollow/outline (private, held
 * close), the outer ring's four points are solid (shared, visible further
 * out) — so the distinction survives even without color. The same idea is
 * already stated as real text in this story's own copy, so the whole scene
 * stays decorative (aria-hidden).
 */
export function MindraWorkVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 480 380" aria-hidden="true">
      <circle className={styles.outerRing} cx="240" cy="210" r="120" />
      <circle className={styles.innerRing} cx="240" cy="210" r="70" />

      {OUTER_DOTS.map((dot, index) => (
        <circle key={index} className={styles.outerDot} cx={dot.cx} cy={dot.cy} r="5" />
      ))}
      {INNER_DOTS.map((dot, index) => (
        <circle key={index} className={styles.innerDot} cx={dot.cx} cy={dot.cy} r="5" />
      ))}

      <EditorialFigure x={240} y={280} scale={1.1} />
    </svg>
  );
}
