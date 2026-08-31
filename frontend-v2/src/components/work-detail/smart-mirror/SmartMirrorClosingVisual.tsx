import styles from "./SmartMirrorClosingVisual.module.css";

/**
 * The closing visual — a reflective close, literally and emotionally: one
 * large, almost entirely empty mirror shape (echoing Chapter 2's "Quiet"
 * state) set inside a soft ambient glow suggesting depth and a single calm
 * light source, no glowing brain, no dense diagram. Text-free — the
 * closing statement and principle live beside it in SmartMirrorClosingStory.
 */
export function SmartMirrorClosingVisual() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <span className={styles.glow} />
      <div className={styles.mirror}>
        <span className={styles.sheen} />
      </div>
    </div>
  );
}
