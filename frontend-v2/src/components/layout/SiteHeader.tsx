"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/Button";
import { PRIMARY_NAV_LINKS, START_PROJECT_LINK } from "@/lib/content/navigation";
import { HeaderNavMenu } from "./HeaderNavMenu";
import { MobileNav } from "./MobileNav";
import styles from "./SiteHeader.module.css";

const MOBILE_NAV_ID = "mobile-nav";

interface SiteHeaderProps {
  /**
   * Opens one section's menu on mount, by href. Only the internal navigation review page sets it —
   * a screenshot cannot click, and the thing worth looking at is the panel open. Absent everywhere
   * a visitor can reach, and `page.review.tsx` is not a page in a production build.
   */
  initialOpenSection?: string;
}

export function SiteHeader({ initialOpenSection }: SiteHeaderProps = {}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  /**
   * Which section menu is open, and whether the visitor put it there deliberately.
   *
   * <p>One at a time, because two panels would overlap. `pinned` is what separates a menu the
   * pointer opened on its way past from one the visitor pressed open: the first closes again when
   * the pointer leaves, the second stays until it is pressed again, Escape, a click outside, or a
   * route change.
   */
  const [openSection, setOpenSection] = useState<{ href: string; pinned: boolean } | null>(
    initialOpenSection ? { href: initialOpenSection, pinned: true } : null,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Anywhere outside the nav closes it. pointerdown rather than click, so the menu is already gone
  // by the time the thing underneath reacts to being pressed.
  useEffect(() => {
    if (!openSection) return;
    function handlePointerDown(event: globalThis.PointerEvent) {
      const target = event.target;
      if (target instanceof Node && navRef.current?.contains(target)) return;
      setOpenSection(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openSection]);

  // A route change closes it, however it was started — a link inside the panel, the browser's back
  // button, or anything else on the page. Without this the panel would hang over the new page.
  //
  // Compared against the last path rather than run on every invocation, so this closes on an
  // actual route change and not merely on an effect firing. React runs effects twice in
  // development on purpose, and a "skip the first run" flag closed the menu on the second — which
  // is how the review page first came out with a header that had no panel under it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setOpenSection(null);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="AROORAA — home">
          <BrandLogo size="header" />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary" ref={navRef}>
          <ul className={styles.navList}>
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              if (link.children) {
                return (
                  <HeaderNavMenu
                    key={link.href}
                    section={{ ...link, children: link.children }}
                    open={openSection?.href === link.href}
                    active={Boolean(isActive)}
                    onHoverOpen={() =>
                      setOpenSection((current) =>
                        current?.href === link.href ? current : { href: link.href, pinned: false },
                      )
                    }
                    onHoverClose={() =>
                      setOpenSection((current) =>
                        current?.href === link.href && !current.pinned ? null : current,
                      )
                    }
                    onPress={() =>
                      setOpenSection((current) =>
                        current?.href === link.href && current.pinned
                          ? null
                          : { href: link.href, pinned: true },
                      )
                    }
                    onClose={() => setOpenSection(null)}
                  />
                );
              }
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
