import { SmartHomePanel } from "./SmartHomePanel";
import styles from "./SmartHomeWaterVisual.module.css";

/**
 * The Water section's visual (P5) — a simple conceptual sump-to-overhead-
 * tank illustration for the How It Works slot, labeled clearly as planned
 * expansion in the section's own title. No electrical wiring, no motor
 * contact/control schematic — just tank level states and the manual
 * override idea, which the section's real badge list already states, so
 * this stays decorative.
 */
export function SmartHomeWaterVisual() {
  return (
    <div aria-hidden="true">
      <SmartHomePanel className={styles.panel}>
        <div className={styles.row}>
          <div className={styles.tank}>
            <p className={styles.tankLabel}>Sump Tank</p>
            <div className={styles.level}>
              <div className={styles.levelFill} style={{ height: "35%" }} />
            </div>
          </div>

          <div className={styles.motorColumn}>
            <span className={styles.arrow}>→</span>
            <div className={styles.motor}>Motor</div>
            <span className={styles.arrow}>→</span>
          </div>

          <div className={styles.tank}>
            <p className={styles.tankLabel}>Overhead Tank</p>
            <div className={styles.level}>
              <div className={styles.levelFill} style={{ height: "80%" }} />
            </div>
          </div>
        </div>
        <p className={styles.note}>Manual override always available</p>
      </SmartHomePanel>
    </div>
  );
}
