import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.eyebrowPill}>AI-first product engineering · MESA is live</span>
        <h1 className={styles.heading}>
          AI-first software products for smarter{" "}
          <span className="gradientText">business operations</span>
        </h1>
        <p className={styles.subtitle}>
          Arooraa builds intelligent platforms for restaurants and modern businesses. Our
          flagship product, MESA, simplifies ordering, kitchen workflows, billing, and AI-powered
          insights — end to end.
        </p>
        <div className={styles.ctaRow}>
          <a href="#mesa" className={`btn btnPrimary ${styles.ctaPrimary}`}>
            Explore MESA
          </a>
          <a href="#demo" className={`btn btnGhostOnDark ${styles.ctaGhost}`}>
            Watch demo
          </a>
        </div>

        <div className={styles.mockupWrap}>
          <div className={styles.mockup}>
            <div className={styles.mockupChrome}>
              <span className={styles.dot} style={{ background: "#ff5f57" }} />
              <span className={styles.dot} style={{ background: "#febc2e" }} />
              <span className={styles.dot} style={{ background: "#28c840" }} />
              <span className={styles.chromeUrl}>app.arooraa.com/mesa/dashboard</span>
            </div>
            <div className={styles.mockupBody} data-testid="dashboard-mockup">
              <aside className={styles.mockupSidebar}>
                <span className={styles.sidebarBrand}>MESA</span>
                <span className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>Dashboard</span>
                <span className={styles.sidebarItem}>Live Orders</span>
                <span className={styles.sidebarItem}>Kitchen</span>
                <span className={styles.sidebarItem}>Menu</span>
                <span className={styles.sidebarItem}>Billing</span>
                <span className={styles.sidebarItem}>Analytics</span>
              </aside>
              <div className={styles.mockupMain}>
                <div className={styles.mockupHeaderRow}>
                  <div>
                    <div className={styles.mockupTitle}>Good evening, Spice Route</div>
                    <div className={styles.mockupSubtle}>Live service · 14 tables active</div>
                  </div>
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    Live
                  </span>
                </div>
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Today&apos;s sales</span>
                    <span className={styles.statValue}>₹84,200</span>
                    <span className={styles.statDelta}>▲ 18% vs avg</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Orders</span>
                    <span className={styles.statValue}>126</span>
                    <span className={styles.statDelta}>▲ 9 in queue</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Avg prep</span>
                    <span className={styles.statValue}>11m</span>
                    <span className={styles.statDeltaDown}>▼ 2m faster</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Table turns</span>
                    <span className={styles.statValue}>3.4×</span>
                    <span className={styles.statDelta}>Peak hours</span>
                  </div>
                </div>
                <div className={styles.chartBlock}>
                  <span className={styles.mockupSubtle}>Sales by hour</span>
                  <div className={styles.bars} aria-hidden="true">
                    {[40, 55, 35, 70, 90, 60, 45, 65, 50, 30].map((h, i) => (
                      <span key={i} className={styles.bar} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className={styles.aiPill}>✦ Ask MESA AI</span>
        </div>
      </div>
    </section>
  );
}
