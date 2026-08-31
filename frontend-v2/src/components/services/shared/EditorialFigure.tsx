import styles from "./EditorialFigure.module.css";

interface EditorialFigureProps {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}

/**
 * Shared editorial "bust" figure primitive (S8) — a simplified, faceless,
 * duotone silhouette (head + shoulders), reused across every service
 * page's picture-story visuals so the family shares one consistent human
 * illustration language while each page varies the surrounding scene and
 * props around it. Deliberately abstract — no skin tone, no facial
 * features, no limbs — to stay premium/editorial rather than cartoonish or
 * clip-art, and to avoid any representation risk: the same duotone
 * convention already used by every other visual on the site (neutral
 * silhouette, indigo accent reserved for the scene's props/highlights).
 *
 * Must be used as a child of an existing <svg> (renders a <g>, not its own
 * root element), so it composes directly into a page's scene composition.
 */
export function EditorialFigure({ x, y, scale = 1, flip = false }: EditorialFigureProps) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`} className={styles.figure}>
      <path d="M-22,44 C-22,12 -15,-4 0,-4 C15,-4 22,12 22,44 Z" />
      <circle cx="0" cy="-20" r="15" />
    </g>
  );
}
