import { SmartHomePanel } from "./SmartHomePanel";
import styles from "./SmartHomeSafetyVisual.module.css";

const DETECTORS = ["Smoke", "LPG", "Water Leak"];

/**
 * The Privacy & Trust section's visual (P5) — carries the prominent, public-
 * safe electrical-safety disclaimer as real, visible text (not baked into
 * an image), plus a small illustrative panel showing that safety-critical
 * detection alarms locally regardless of connectivity. Not aria-hidden: the
 * disclaimer is unique content, required to be genuinely readable, not just
 * decorative.
 */
export function SmartHomeSafetyVisual() {
  return (
    <SmartHomePanel className={styles.panel}>
      <p className={styles.disclaimer}>
        Arooraa Smart Home is currently a product/prototype initiative. Any mains-connected installation requires
        correctly rated, certified equipment and qualified electrical installation and sign-off.
      </p>

      <div className={styles.detectorRow} aria-hidden="true">
        {DETECTORS.map((detector) => (
          <div key={detector} className={styles.detector}>
            <span className={styles.dot} />
            <span className={styles.detectorLabel}>{detector}</span>
            <span className={styles.detectorNote}>Local alarm</span>
          </div>
        ))}
      </div>
    </SmartHomePanel>
  );
}
