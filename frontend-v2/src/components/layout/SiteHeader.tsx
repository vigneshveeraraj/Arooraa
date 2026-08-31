"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/Button";
import { PRIMARY_NAV_LINKS, START_PROJECT_LINK } from "@/lib/content/navigation";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";

const MOBILE_NAV_ID = "mobile-nav";

export function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="AROORAA — home">
          <BrandLogo size="header" />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          <ul className={styles.navList}>
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button href={START_PROJECT_LINK.href} variant="primary" className={styles.desktopCta}>
            {START_PROJECT_LINK.label}
          </Button>
          <Button href={START_PROJECT_LINK.href} variant="primary" className={styles.compactCta}>
            Start
          </Button>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={mobileNavOpen}
            aria-controls={MOBILE_NAV_ID}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen((current) => !current)}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span className={`${styles.menuBar} ${mobileNavOpen ? styles.menuBarTopOpen : ""}`} />
              <span className={`${styles.menuBar} ${mobileNavOpen ? styles.menuBarMiddleOpen : ""}`} />
              <span className={`${styles.menuBar} ${mobileNavOpen ? styles.menuBarBottomOpen : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <MobileNav
        id={MOBILE_NAV_ID}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </header>
  );
}
