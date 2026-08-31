import { ENGINEERING_STACK_LAYERS } from "@/lib/content/work-detail/mesa";
import styles from "./EngineeringStackVisual.module.css";

const LAYER_WIDTHS = [100, 92, 84, 76, 68, 60, 52, 44];

/**
 * Chapter 13's engineering stack — eight layers stacked top to bottom,
 * narrowing as they go, converging on one labeled point at the bottom
 * ("One Restaurant Experience") rather than reading as a technology-logo
 * wall. Real, visible layer names throughout — the point is how many
 * layers collectively support one experience, not a badge collection.
 */
export function EngineeringStackVisual() {
  return (
    <div className={styles.stack}>
      {ENGINEERING_STACK_LAYERS.map((layer, index) => (
        <div key={layer} className={styles.layer} style={{ width: `${LAYER_WIDTHS[index] ?? 100}%` }}>
          {layer}
        </div>
      ))}
      <span className={styles.convergeLine} aria-hidden="true" />
      <span className={styles.convergePoint} aria-hidden="true" />
      <p className={styles.convergeLabel}>One Restaurant Experience</p>
    </div>
  );
}
