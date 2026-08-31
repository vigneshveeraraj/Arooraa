import { EditorialFigure } from "@/components/services/shared/EditorialFigure";
import styles from "./MesaWorkVisual.module.css";

const ORDER_DOTS = [
  { cx: 480, cy: 70 },
  { cx: 505, cy: 70 },
  { cx: 530, cy: 70 },
  { cx: 555, cy: 70 },
];

/**
 * MESA's flagship visual story (W1, substantially enlarged W1.1) — a
 * restaurant experience scene, not a dashboard or a flowchart. The dining
 * table is the hero object at the center, with a menu card and place
 * settings on it. A guest stands at the table with the menu; a waiter
 * approaches from the kitchen side carrying a tray, with a couple of short
 * motion ticks suggesting movement (not a wired connector). The kitchen
 * pass sits above with order tickets and a "ready" plate; a billing
 * counter with a screen and a receipt sits to the side. A smaller, muted
 * second table in the background hints that this is a full restaurant
 * floor, not a single isolated interaction. Passes the "hide the paragraph"
 * test on its own: table + guest + waiter + kitchen + billing, all visibly
 * gathered around one scene. No exposed service architecture, no labels —
 * the same idea is already stated as real text in this story's own copy, so
 * the whole scene stays decorative (aria-hidden).
 */
export function MesaWorkVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 640 480" aria-hidden="true">
      <ellipse className={styles.bgTable} cx="100" cy="90" rx="38" ry="12" />
      <line className={styles.bgTableLeg} x1="100" y1="102" x2="100" y2="130" />

      <ellipse className={styles.tableShadow} cx="320" cy="300" rx="118" ry="22" />
      <ellipse className={styles.table} cx="320" cy="280" rx="112" ry="36" />
      <line className={styles.tableLeg} x1="320" y1="316" x2="320" y2="380" />
      <rect className={styles.menuCard} x="270" y="248" width="40" height="52" rx="4" transform="rotate(-6 290 274)" />
      <circle className={styles.plate} cx="250" cy="270" r="13" />
      <circle className={styles.plate} cx="390" cy="290" r="13" />

      <EditorialFigure x={230} y={400} scale={1.15} />

      <rect className={styles.tray} x="452" y="330" width="34" height="8" rx="3" transform="rotate(-8 469 334)" />
      <EditorialFigure x={470} y={360} scale={1.05} flip />
      <line className={styles.motionTick} x1="500" y1="352" x2="512" y2="346" />
      <line className={styles.motionTick} x1="516" y1="342" x2="528" y2="336" />

      <rect className={styles.kitchenPass} x="460" y="70" width="140" height="40" rx="8" />
      {ORDER_DOTS.map((dot, index) => (
        <circle key={index} className={styles.orderDot} cx={dot.cx} cy={dot.cy} r="5" />
      ))}
      <circle className={styles.readyPlate} cx="580" cy="90" r="10" />

      <rect className={styles.counter} x="520" y="380" width="90" height="50" rx="8" />
      <rect className={styles.screen} x="535" y="390" width="30" height="18" rx="3" />
      <rect className={styles.receipt} x="575" y="370" width="26" height="40" rx="3" transform="rotate(8 588 390)" />
      <line className={styles.receiptLine} x1="580" y1="382" x2="597" y2="382" />
      <line className={styles.receiptLine} x1="580" y1="392" x2="597" y2="392" />
    </svg>
  );
}
