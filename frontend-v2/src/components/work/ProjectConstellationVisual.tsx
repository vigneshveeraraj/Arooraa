import styles from "./ProjectConstellationVisual.module.css";

const OUTER_ORBIT_DOTS = [
  { cx: 468, cy: 120 },
  { cx: 420, cy: 72 },
  { cx: 372, cy: 120 },
  { cx: 420, cy: 168 },
];

const INNER_ORBIT_DOTS = [
  { cx: 438, cy: 138 },
  { cx: 402, cy: 102 },
];

const CONNECTORS = [
  "M150,225 Q210,340 280,398",
  "M420,168 Q360,320 285,398",
  "M150,370 Q210,395 275,400",
  "M420,340 Q350,390 285,400",
];

/**
 * The Our Work hero visual (W1, substantially enlarged W1.1) — an original
 * "project world," not a screenshot and not an architecture diagram: four
 * distinct, richer objects standing in for the four products, each
 * connected by a very faint, dashed line to one shared, deliberately
 * subtle origin point. Browser review of W1 found the objects too small
 * and the composition too sparse for the space available — this version
 * gives every object roughly double the presence (bigger shapes, an extra
 * silhouette detail each — chairs at the table, a stand under the mirror, a
 * door and window on the house, a second inner orbit ring for Mindra — plus
 * a soft shadow beneath each for depth) while keeping the scene label-free
 * and the shared origin point small. No product logos. The meaning
 * ("different products, one product-engineering mindset") is already
 * carried by the hero's own real text, so the whole scene stays decorative
 * (aria-hidden).
 */
export function ProjectConstellationVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 560 440" aria-hidden="true">
      {CONNECTORS.map((d, index) => (
        <path key={index} className={styles.connector} d={d} />
      ))}

      {/* MESA — the table, slightly the largest object */}
      <ellipse className={styles.tableShadow} cx="150" cy="168" rx="62" ry="14" />
      <ellipse className={styles.table} cx="150" cy="150" rx="58" ry="18" />
      <line className={styles.tableLeg} x1="150" y1="168" x2="150" y2="225" />
      <circle className={styles.plate} cx="118" cy="140" r="10" />
      <circle className={styles.plate} cx="182" cy="158" r="10" />
      <path className={styles.chair} d="M85,150 Q75,150 75,170" />
      <path className={styles.chair} d="M225,150 Q235,150 235,170" />

      {/* Mindra — a clearly personal, two-ring orbit */}
      <circle className={styles.orbitOuterRing} cx="420" cy="120" r="48" />
      <circle className={styles.orbitInnerRing} cx="420" cy="120" r="26" />
      <circle className={styles.orbitCenter} cx="420" cy="120" r="8" />
      {OUTER_ORBIT_DOTS.map((dot, index) => (
        <circle key={index} className={styles.orbitDotOuter} cx={dot.cx} cy={dot.cy} r="5" />
      ))}
      {INNER_ORBIT_DOTS.map((dot, index) => (
        <circle key={index} className={styles.orbitDotInner} cx={dot.cx} cy={dot.cy} r="4" />
      ))}

      {/* Smart Mirror — tall, standing, reflective */}
      <ellipse className={styles.mirrorShadow} cx="150" cy="372" rx="40" ry="10" />
      <rect className={styles.mirrorBody} x="120" y="250" width="60" height="110" rx="30" />
      <rect className={styles.mirrorStand} x="142" y="360" width="16" height="10" rx="2" />
      <path className={styles.mirrorHighlight} d="M132,275 Q150,258 168,275" />

      {/* Smart Home — an environmental house form */}
      <ellipse className={styles.houseShadow} cx="420" cy="372" rx="48" ry="10" />
      <path className={styles.roof} d="M375,280 L420,240 L465,280 Z" />
      <rect className={styles.houseBody} x="384" y="280" width="72" height="60" rx="4" />
      <rect className={styles.houseDoor} x="410" y="310" width="20" height="30" rx="2" />
      <rect className={styles.houseWindow} x="394" y="294" width="14" height="14" rx="2" />
      <circle className={styles.houseNode} cx="440" cy="300" r="4" />

      <circle className={styles.origin} cx="280" cy="400" r="6" />
    </svg>
  );
}
