import styles from "./MesaIntro.module.css";

const FEATURES = [
  {
    title: "8 minutes to 2",
    body: "guests scan a QR and order in 90 seconds. No app, no account, no waiting for a waiter.",
  },
  {
    title: "A kitchen that runs itself",
    body: "per-station tickets with live timers; sold-out items vanish from every menu instantly.",
  },
  {
    title: "Restaurant Health Score",
    body: "one number, 0–100, for the live health of your business, plus daily AI insights on offers, staffing and menu.",
  },
] as const;

export function MesaIntro() {
  return (
    <section id="mesa" className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className="eyebrow">Flagship product</p>
          <h2 className={styles.heading}>Meet MESA, the restaurant operating platform.</h2>
          <p className={styles.subtitle}>
            From QR ordering to kitchen operations, billing, analytics, and AI-powered insights —
            MESA connects every part of your restaurant so service stays fast and decisions stay
            clear.
          </p>
          <ul className={styles.featureList}>
            {FEATURES.map((f) => (
              <li key={f.title}>
                <strong>{f.title}</strong> — {f.body}
              </li>
            ))}
          </ul>
          <a href="#journey" className={`btn btnDarkOnLight`}>
            See the full journey →
          </a>
        </div>

        <div className={styles.mockupWrap}>
          <div className={styles.phone}>
            <div className={styles.phoneHeader}>
              <span className={styles.phoneTitle}>Table 07</span>
              <span className={styles.phoneSubtitle}>Spice Route</span>
            </div>
            <div className={styles.phoneTabs}>
              <span className={`${styles.phoneTab} ${styles.phoneTabActive}`}>Starters</span>
              <span className={styles.phoneTab}>Mains</span>
              <span className={styles.phoneTab}>Drinks</span>
            </div>
            <div className={styles.menuItem}>
              <div>
                <div className={styles.menuItemName}>Paneer Tikka</div>
                <div className={styles.menuItemDesc}>Smoky, char-grilled</div>
              </div>
              <div className={styles.menuItemRight}>
                <span>₹240</span>
                <span className={styles.addBtn}>+</span>
              </div>
            </div>
            <div className={styles.menuItem}>
              <div>
                <div className={styles.menuItemName}>Garden Salad</div>
                <div className={styles.menuItemDesc}>Fresh &amp; crunchy</div>
              </div>
              <div className={styles.menuItemRight}>
                <span>₹180</span>
                <span className={styles.addBtn}>+</span>
              </div>
            </div>
            <div className={styles.phoneFooter}>
              <span>3 items · ₹660</span>
              <span className={styles.placeOrderBtn}>Place order</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
