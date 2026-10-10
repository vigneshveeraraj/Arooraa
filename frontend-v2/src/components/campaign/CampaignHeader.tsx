"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CAMPAIGN_CONTACT, CAMPAIGN_PAGE_LINKS, CAMPAIGN_SITE_LINKS, HERO, TALK_TO_TEAM_LABEL } from "@/lib/content/grow-your-business";
import { CampaignIcon } from "./CampaignIcon";
import styles from "./CampaignHeader.module.css";

/** Matches the CSS breakpoint where the inline links replace the menu button. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * The campaign's own header: the real AROORAA logo (the main site's BrandLogo), section
 * links, a link back to the English site, and an always-visible "Talk to Our Team" button
 * that opens the consultation form (direct WhatsApp and call stay in the menu).
 *
 * Links into the English site use prefetch={false}: a campaign visitor has not asked for
 * those pages, so they are not fetched in the background on a mobile connection.
 */
export function CampaignHeader() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    // Widening past the breakpoint hides the toggle that controls the menu; close it
    // rather than leave an orphaned panel open.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" prefetch={false} className={styles.brand} aria-label="AROORAA — main website">
          <BrandLogo size="header" />
        </Link>

        <nav className={styles.desktopNav} aria-label="Page sections">
          {CAMPAIGN_PAGE_LINKS.slice(0, 3).map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Link href="/" prefetch={false} className={styles.mainSite}>
            Main Website
            <CampaignIcon name="arrowUpRight" className={styles.smallIcon} />
          </Link>
        </nav>

        <div className={styles.actions}>
          <a className={styles.cta} href="#contact">
            {TALK_TO_TEAM_LABEL}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="campaign-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <CampaignIcon name={open ? "x" : "menu"} className={styles.toggleIcon} />
          </button>
        </div>
      </div>

      <div id="campaign-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Page sections (menu)">
          <p className={styles.menuLabel}>On this page</p>
          <ul className={styles.menuList}>
            {CAMPAIGN_PAGE_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="AROORAA website (menu)">
          <p className={styles.menuLabel}>Explore AROORAA</p>
          <ul className={styles.menuList}>
            {CAMPAIGN_SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} prefetch={false} onClick={close}>
                  {link.label}
                  <CampaignIcon name="arrowUpRight" className={styles.smallIcon} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.menuContact}>
          <a className={styles.menuWhatsapp} href={CAMPAIGN_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
            <CampaignIcon name="whatsapp" className={styles.ctaIcon} />
            <span lang="ta">{HERO.whatsappLabel}</span>
          </a>
          <a className={styles.menuCall} href={`tel:${CAMPAIGN_CONTACT.phoneE164}`}>
            <CampaignIcon name="phone" className={styles.ctaIcon} />
            {CAMPAIGN_CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </header>
  );
}
