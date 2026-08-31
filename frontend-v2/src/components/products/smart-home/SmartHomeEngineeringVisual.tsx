import { SmartHomePanel } from "./SmartHomePanel";
import styles from "./SmartHomeEngineeringVisual.module.css";

/**
 * The Engineering section's visual (P5) — rendered at flagship scale via
 * stackedVisualSections. Real, visible text names Raspberry Pi 5 and ESP32
 * with prototype-only framing (no partnership/certification implied); the
 * diagram is a customer-facing conceptual flow only — no MQTT topic names,
 * wiring, ports, serial pinouts, meter models, CT ratios, credentials or
 * private network design, per the brief's explicit restraint.
 */
export function SmartHomeEngineeringVisual() {
  return (
    <SmartHomePanel className={styles.panel}>
      <p className={styles.intro}>
        The prototype direction uses Raspberry Pi 5 as the local gateway for early home automation and integration
        experiments. ESP32-based low-voltage device experimentation continues separately from household mains, which
        stays the responsibility of a qualified electrician.
      </p>

      <div className={styles.diagram} aria-hidden="true">
        <div className={styles.node}>Sensors / Selected Controls</div>
        <span className={styles.arrow}>↓</span>
        <div className={`${styles.node} ${styles.gatewayNode}`}>Local Home Gateway — Raspberry Pi 5</div>
        <span className={styles.arrow}>↓</span>
        <div className={styles.branchRow}>
          <div className={styles.node}>Mobile Experience</div>
          <div className={styles.node}>Optional Cloud</div>
        </div>
      </div>
    </SmartHomePanel>
  );
}
