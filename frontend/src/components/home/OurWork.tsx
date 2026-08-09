import styles from "./OurWork.module.css";

export function OurWork() {
  return (
    <section id="work" className={styles.section}>
      <div className="container">
        <p className="eyebrow">Our work</p>
        <h2 className={styles.heading}>Engineering capability, not just a pitch.</h2>
        <p className={styles.subtitle}>
          The same team and discipline that builds MESA is available for your business — AI
          implementation and full-cycle software product engineering.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>AI &amp; Automation Capability</h3>
            <ul className={styles.bulletList}>
              <li>Business analytics &amp; forecasting</li>
              <li>Workflow &amp; operations automation</li>
              <li>Custom AI assistants &amp; agents</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Product &amp; Platform Engineering</h3>
            <ul className={styles.bulletList}>
              <li>SaaS product engineering</li>
              <li>Cloud, DevOps &amp; scalable architecture</li>
              <li>Long-term software support</li>
            </ul>
          </div>
        </div>

        <a href="#mesa" className={styles.proofLink}>
          See it in practice — MESA is built the same way ↑
        </a>
      </div>
    </section>
  );
}
