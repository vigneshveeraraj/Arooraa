"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/site-content";
import { BookDemoButton } from "@/components/demo-request/BookDemoButton";
import styles from "./Nav.module.css";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="aroo-mark" x1="2" y1="2" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9B8BFF" />
                <stop offset="1" stopColor="#5B4BE0" />
              </linearGradient>
            </defs>
            <rect x="1.5" y="1.5" width="31" height="31" rx="9.5" fill="url(#aroo-mark)" />
            <path
              d="M17 7.5 L25.5 26.5 H21.4 L19.85 22.7 H14.15 L12.6 26.5 H8.5 Z M15.3 19.2 H18.7 L17 14.9 Z"
              fill="#fff"
            />
            <circle cx="24.5" cy="9.5" r="2" fill="#fff" opacity="0.85" />
          </svg>
          <span className={styles.brandName}>AROORAA</span>
        </a>

        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
              {"badge" in link && link.badge ? <span className={styles.badge}>{link.badge}</span> : null}
            </a>
          ))}
        </div>

        <div className={styles.navContact}>
          <a href="#contact" className={styles.contactLink}>
            Contact
          </a>
          <BookDemoButton className={styles.demoLinkBtn}>Book a Demo</BookDemoButton>
          <Link href="/start-project" className={styles.startProjectButton}>
            Start a Project
          </Link>
        </div>
      </div>
    </nav>
  );
}
