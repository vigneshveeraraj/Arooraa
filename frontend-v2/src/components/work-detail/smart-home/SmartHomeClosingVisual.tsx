import styles from "./SmartHomeClosingVisual.module.css";
import { HouseIcon } from "./SmartHomeIcons";

/**
 * The closing visual — a calm, softly lit house set inside a warm ambient
 * glow, echoing the whole-home story without repeating its raster image.
 * Text-free — the closing statement and principle live beside it in
 * SmartHomeClosingStory.
 */
export function SmartHomeClosingVisual() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <span className={styles.glow} />
      <div className={styles.card}>
        <span className={styles.houseIcon}>
          <HouseIcon />
        </span>
      </div>
    </div>
  );
}
