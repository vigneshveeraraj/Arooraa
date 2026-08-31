import { SmartMirrorFrame } from "./SmartMirrorFrame";
import { SmartMirrorInfoRow } from "./SmartMirrorInfoRow";
import styles from "./SmartMirrorScatteredToCalm.module.css";

const SCATTERED_APPS = ["Calendar App", "Chat App", "Vendor App", "Wellness App"];

/**
 * A picture-story visual for The Problem (P4) — the same scattered → calm
 * contrast established for MESA and Mindra, reused here for a genuinely
 * shared visual grammar across the whole product family, but converging
 * into the Smart Mirror frame instead of a restaurant card or Mindra phone
 * so it still reads as clearly Smart Mirror's own moment. Every scattered
 * app name and mirror row is real, accessible text; only the connecting
 * arrow is decorative.
 */
export function SmartMirrorScatteredToCalm() {
  return (
    <div className={styles.story}>
      <ul className={styles.scatter} data-testid="scattered-panel">
        {SCATTERED_APPS.map((app, index) => (
          <li key={app} className={styles.chip} data-tilt={index % 2 === 0 ? "left" : "right"}>
            {app}
          </li>
        ))}
      </ul>

      <span className={styles.arrow} aria-hidden="true">
        ↓
      </span>

      <SmartMirrorFrame>
        <p className={styles.calmLabel}>One calm surface</p>
        <SmartMirrorInfoRow glyph="event" label="Everything, one glance" />
      </SmartMirrorFrame>
    </div>
  );
}
