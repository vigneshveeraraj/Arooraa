import { SmartHomePanel } from "./SmartHomePanel";
import styles from "./SmartHomeLocalFirstVisual.module.css";

/**
 * The local-first companion visual (P5) — a simple conceptual Home → Local
 * Home Layer → Optional Cloud diagram for the Product Vision section.
 * Deliberately customer-facing only: no MQTT, ports, VLANs, protocols, IP
 * addressing or database architecture. Every idea shown here is already
 * stated as real text in the section's own body copy, so this stays
 * decorative (aria-hidden).
 */
export function SmartHomeLocalFirstVisual() {
  return (
    <div aria-hidden="true">
      <SmartHomePanel className={styles.panel}>
        <div className={styles.row}>
          <span className={styles.chip}>Energy</span>
          <span className={styles.chip}>Control</span>
          <span className={styles.chip}>Water</span>
          <span className={styles.chip}>Safety</span>
        </div>

        <span className={styles.arrow}>↓</span>

        <div className={styles.core}>Local Home Layer</div>

        <span className={styles.arrow}>↓</span>

        <p className={styles.outcome}>Works inside the home</p>

        <div className={styles.cloudRow}>
          <span className={styles.branch}>↘</span>
          <div className={styles.cloud}>
            <p className={styles.cloudLabel}>Optional Cloud</p>
            <p className={styles.cloudDetail}>Remote access · History · Intelligence</p>
          </div>
        </div>
      </SmartHomePanel>
    </div>
  );
}
