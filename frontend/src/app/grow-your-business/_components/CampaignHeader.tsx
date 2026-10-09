"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArooraaLogo } from "./ArooraaLogo";
import { Icon } from "./Icon";
import { CONTACT, PAGE_LINKS, SITE_LINKS } from "./content";
import { keepSuffix } from "./keepSuffix";
import styles from "./CampaignHeader.module.css";
import ui from "./ui.module.css";

/** Matches the CSS breakpoint where the inline links give way to the menu button. */
const DESKTOP_QUERY = "(min-width: 1024px)";

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
    // Widening the window past the breakpoint hides the button that controls the menu,
    // so close the menu rather than leave an orphaned panel open.
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
      <div className={`${ui.shell} ${styles.bar}`}>
        <ArooraaLogo idSuffix="header" />

        <nav className={styles.desktopNav} aria-label="Page sections">
          {PAGE_LINKS.slice(0, 3).map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Link prefetch={false} href="/" className={styles.mainSite}>
            Main Website
            <Icon name="arrowUpRight" size={16} />
          </Link>
        </nav>

        <div className={styles.actions}>
          <a className={`${ui.button} ${ui.whatsapp} ${styles.cta}`} href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={18} />
            <span>
              WhatsApp<span className={styles.ctaLong}> Us</span>
            </span>
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
            <Icon name={open ? "x" : "menu"} size={24} />
          </button>
        </div>
      </div>

      <div id="campaign-menu" className={styles.menu} hidden={!open}>
        <div className={ui.shell}>
          <nav aria-label="Page sections (menu)">
            <p className={styles.menuLabel}>On this page</p>
            <ul className={styles.menuList}>
              {PAGE_LINKS.map((link) => (
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
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link prefetch={false} href={link.href} onClick={close}>
                    {link.label}
                    <Icon name="arrowUpRight" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.menuContact}>
            <a className={`${ui.button} ${ui.whatsapp}`} href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
              <Icon name="whatsapp" size={20} />
              <span lang="ta">{keepSuffix("WhatsApp-ல் பேசலாம்")}</span>
            </a>
            <a className={`${ui.button} ${ui.outline}`} href={`tel:${CONTACT.phoneE164}`}>
              <Icon name="phone" size={18} />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
