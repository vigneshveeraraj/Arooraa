import { ENGINEERING_INTELLIGENCE_NOTE, ENGINEERING_LAYERS, RASPBERRY_PI_FRAMING } from "@/lib/content/work-detail/smart-home";
import styles from "./EngineeringFoundationVisual.module.css";

/**
 * Chapter 10 — four solid, stacked foundation layers (Physical Home at
 * the base up to Home Experience at the top), with intelligence rendered
 * as a separate, visibly detached, dashed layer floating above — optional
 * and later, never part of the reliable stack itself.
 */
export function EngineeringFoundationVisual() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stackColumn}>
        <div className={styles.intelligenceLayer}>
          <span>Intelligence (optional, later)</span>
        </div>
        <span className={styles.gap} aria-hidden="true" />
        <div className={styles.stack}>
          {ENGINEERING_LAYERS.map((layer, index) => (
            <div key={layer} className={styles.layer} style={{ opacity: 0.64 + index * 0.12 }}>
              {layer}
            </div>
          ))}
        </div>
      </div>

      <p className={styles.note}>{ENGINEERING_INTELLIGENCE_NOTE}</p>
      <p className={styles.piFraming}>{RASPBERRY_PI_FRAMING}</p>
    </div>
  );
}
