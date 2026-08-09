import Link from "next/link";
import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.eyebrowPill}>Product Engineering & Innovation</span>
        <h1 className={styles.heading}>
          From idea to production —{" "}
          <span className="gradientText">we build the software your business needs</span>
        </h1>
        <p className={styles.subtitle}>
          Arooraa is a product engineering partner for founders and businesses — from early discovery
          through to a live, supported product. MESA, our restaurant operating platform, is proof of
          how we build.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/start-project" className={`btn btnPrimary ${styles.ctaPrimary}`}>
            Start a Project
          </Link>
          <a href="#mesa" className={`btn btnGhostOnDark ${styles.ctaGhost}`}>
            Explore Our Products
          </a>
        </div>
        <BookDemoButton className={styles.demoLink}>or Book a MESA Demo</BookDemoButton>

        <div className={styles.mockupWrap}>
          <div className={styles.mockup}>
            <div className={styles.mockupChrome}>
              <span className={styles.dot} style={{ background: "#ff5f57" }} />
              <span className={styles.dot} style={{ background: "#febc2e" }} />
              <span className={styles.dot} style={{ background: "#28c840" }} />
              <span className={styles.chromeUrl}>app.arooraa.com/studio/pipeline</span>
            </div>
            <div className={styles.mockupBody} data-testid="dashboard-mockup">
              <aside className={styles.mockupSidebar}>
                <span className={styles.sidebarBrand}>AROORAA</span>
                <span className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>Discovery</span>
                <span className={styles.sidebarItem}>Product Definition</span>
                <span className={styles.sidebarItem}>Architecture</span>
                <span className={styles.sidebarItem}>Development</span>
                <span className={styles.sidebarItem}>Testing &amp; QA</span>
                <span className={styles.sidebarItem}>Deployment</span>
              </aside>
              <div className={styles.mockupMain}>
                <div className={styles.mockupHeaderRow}>
                  <div>
                    <div className={styles.mockupTitle}>Your Product</div>
                    <div className={styles.mockupSubtle}>Discovery → Production · Live engineering board</div>
                  </div>
                  <span className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    In progress
                  </span>
                </div>
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Pipeline stage</span>
                    <span className={styles.statValue}>Architecture</span>
                    <span className={styles.statDelta}>of 8 stages</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Team</span>
                    <span className={styles.statValue}>Cross-functional</span>
                    <span className={styles.statDelta}>Design + Engineering</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Status</span>
                    <span className={styles.statValue}>On track</span>
                    <span className={styles.statDelta}>Weekly syncs</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Delivery model</span>
                    <span className={styles.statValue}>Iterative</span>
                    <span className={styles.statDelta}>Ship &amp; learn</span>
                  </div>
                </div>
                <div className={styles.chartBlock}>
                  <span className={styles.mockupSubtle}>Sprint velocity</span>
                  <div className={styles.bars} aria-hidden="true">
                    {[40, 55, 35, 70, 90, 60, 45, 65, 50, 30].map((h, i) => (
                      <span key={i} className={styles.bar} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className={styles.aiPill}>✦ From idea to production</span>
        </div>
      </div>
    </section>
  );
}
