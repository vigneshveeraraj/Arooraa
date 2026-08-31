import styles from "./SmartMirrorPersonalFamilyVisual.module.css";

/**
 * A visual for Personal + Family Experience (P4) — two structured panels
 * with a restrained bridge, the same "private / shared deliberately"
 * grammar established for Mindra's My Space / Family Space, restyled here
 * with Smart Mirror's own frame language (dark bezel accent, not a phone)
 * so it stays clearly part of this product's own visual family rather
 * than a copy of Mindra's component. Real, accessible text throughout —
 * this carries unique meaning not stated elsewhere on the page. No
 * identity model, user IDs, household model or face-recognition internals
 * are represented.
 */
export function SmartMirrorPersonalFamilyVisual() {
  return (
    <div className={styles.spaces}>
      <div className={styles.panel}>
        <p className={`text-eyebrow ${styles.panelLabel}`}>My Space</p>
        <p className={styles.panelBody}>Private reminders, notes and personal information.</p>
      </div>

      <span className={styles.bridge} aria-hidden="true" />

      <div className={`${styles.panel} ${styles.familyPanel}`}>
        <p className={`text-eyebrow ${styles.panelLabel}`}>Family Space</p>
        <p className={styles.panelBody}>Shared tasks, groceries, calendar items and household information.</p>
      </div>
    </div>
  );
}
