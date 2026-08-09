import styles from "./SmartMirrorTeaser.module.css";

export function SmartMirrorTeaser() {
  return (
    <section id="mirror" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className="eyebrow">Future innovation</p>
          <h2 className={styles.heading}>The Smart Mirror.</h2>
          <p className={styles.subtitle}>
            Not just a mirror — an intelligent companion that understands your day. AI, computer
            vision, voice in five languages, and health insights in a beautiful everyday object.
            No apps. No typing. Just look.
          </p>
          <a href="/smart-mirror.html" className="btn btnGhostOnDark">
            Explore the Smart Mirror →
          </a>
        </div>

        <div className={styles.mirrorWrap}>
          <div className={styles.mirror}>
            <div className={styles.mirrorTime}>7:42</div>
            <div className={styles.mirrorMeta}>Friday · 24°C clear</div>
            <div className={styles.mirrorCard}>
              <span className={styles.mirrorCardLabel}>Next</span>
              <span className={styles.mirrorCardValue}>Team standup · 9:00</span>
            </div>
            <div className={styles.mirrorCard}>
              <span className={styles.mirrorCardLabel}>✦ Ambient AI</span>
              <span className={styles.mirrorCardValue}>Traffic is light — leave by 8:20.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
