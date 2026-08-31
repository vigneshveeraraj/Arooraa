import styles from "./SmartHomeWorkVisual.module.css";

const ROOM_LINKS = [
  "M240,255 Q186,230 133,190",
  "M245,255 Q243,225 240,194",
  "M255,255 Q310,220 347,190",
];

/**
 * Arooraa Smart Home's visual story (W1) — a house cross-section, not a
 * control-panel dashboard: a roofline and body divided into three rooms,
 * each holding one abstract system (a light, an energy/comfort unit, a
 * water tank) plus a physical switch that stays present and usable. A
 * small local controller sits apart from the rooms, with short, faint
 * proximity paths to each — relationships, not wiring — standing in for
 * "local intelligence" without exposing relays, contactors or any real
 * implementation detail. The same idea is already stated as real text in
 * this story's own copy, so the whole scene stays decorative (aria-hidden).
 */
export function SmartHomeWorkVisual() {
  return (
    <svg className={styles.svg} viewBox="0 0 480 320" aria-hidden="true">
      <path className={styles.roof} d="M60,120 L240,40 L420,120 Z" />
      <rect className={styles.houseBody} x="80" y="120" width="320" height="160" rx="4" />
      <line className={styles.roomDivider} x1="186" y1="120" x2="186" y2="280" />
      <line className={styles.roomDivider} x1="294" y1="120" x2="294" y2="280" />

      {ROOM_LINKS.map((d, index) => (
        <path key={index} className={styles.link} d={d} />
      ))}

      <circle className={styles.lightRing} cx="133" cy="160" r="10" />
      <circle className={styles.lightCore} cx="133" cy="160" r="4" />

      <rect className={styles.switchPlate} x="100" y="190" width="10" height="18" rx="2" />
      <circle className={styles.switchToggle} cx="105" cy="196" r="2" />

      <rect className={styles.energyNode} x="230" y="173" width="20" height="14" rx="3" />
      <circle className={styles.energyDot} cx="240" cy="165" r="3" />

      <rect className={styles.waterTank} x="339" y="150" width="16" height="40" rx="4" />
      <line className={styles.waterLevel} x1="339" y1="172" x2="355" y2="172" />

      <rect className={styles.controller} x="226" y="244" width="28" height="22" rx="4" />
    </svg>
  );
}
