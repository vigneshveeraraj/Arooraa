import Link from "next/link";
import { FOOTER_COMPANY_LINKS, FOOTER_PRODUCT_LINKS } from "@/lib/site-content";
import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="aroo-mark-footer" x1="2" y1="2" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9B8BFF" />
                  <stop offset="1" stopColor="#5B4BE0" />
                </linearGradient>
              </defs>
              <rect x="1.5" y="1.5" width="31" height="31" rx="9.5" fill="url(#aroo-mark-footer)" />
              <path
                d="M17 7.5 L25.5 26.5 H21.4 L19.85 22.7 H14.15 L12.6 26.5 H8.5 Z M15.3 19.2 H18.7 L17 14.9 Z"
                fill="#fff"
              />
            </svg>
            <span className={styles.brandName}>AROORAA</span>
          </div>
          <p className={styles.tagline}>
            AI-first software products for real-world business operations. MESA is our flagship.
          </p>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Product</h3>
          <ul className={styles.linkList}>
            {FOOTER_PRODUCT_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Company</h3>
          <ul className={styles.linkList}>
            {FOOTER_COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Get Started</h3>
          <div className={styles.getStartedButtons}>
            <Link href="/start-project" className={styles.demoButton}>
              Start a Project
            </Link>
            <BookDemoButton className={styles.secondaryButton}>Book a MESA Demo</BookDemoButton>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <span>© 2026 Arooraa. All rights reserved.</span>
        <span>Built AI-first · Engineering-disciplined</span>
      </div>
    </footer>
  );
}
