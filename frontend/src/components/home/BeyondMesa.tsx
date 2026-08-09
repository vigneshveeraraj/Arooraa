import styles from "./BeyondMesa.module.css";

export function BeyondMesa() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className="eyebrow">Beyond MESA</p>
        <h2 className={styles.heading}>The team that builds intelligent products.</h2>
        <p className={styles.subtitle}>
          The same engineering discipline behind MESA is available for your business — AI
          implementation and full-cycle software product engineering.
        </p>

        <div className={styles.grid}>
          <div id="solutions" className={styles.card}>
            <h3 className={styles.cardTitle}>AI Solutions</h3>
            <p className={styles.cardBody}>
              Help businesses use AI to increase sales, understand customers, automate
              operations, and make faster decisions.
            </p>
            <ul className={styles.bulletList}>
              <li>Business analytics &amp; forecasting</li>
              <li>Workflow &amp; operations automation</li>
              <li>Custom AI assistants &amp; agents</li>
            </ul>
          </div>

          <div id="services" className={styles.card}>
            <h3 className={styles.cardTitle}>Software Services</h3>
            <p className={styles.cardBody}>
              Product engineering and full-cycle software services built with real-world product
              experience — not theory.
            </p>
            <ul className={styles.bulletList}>
              <li>SaaS product engineering</li>
              <li>Cloud, DevOps &amp; scalable architecture</li>
              <li>Long-term software support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
