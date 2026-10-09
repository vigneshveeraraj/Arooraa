import Link from "next/link";
import { ArooraaLogo } from "./ArooraaLogo";
import { CONTACT, PAGE_LINKS, SITE_LINKS } from "./content";
import { keepSuffix } from "./keepSuffix";
import styles from "./CampaignFooter.module.css";
import ui from "./ui.module.css";

export function CampaignFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${ui.shell} ${styles.grid}`}>
        <div className={styles.brand}>
          <ArooraaLogo idSuffix="footer" tone="dark" />
          <p>Technology solutions for businesses ready to move forward.</p>
          <p className={styles.region} lang="ta">
            {keepSuffix("Tamil Nadu முழுவதும் உள்ள business-களுக்கு")}
          </p>
        </div>

        <nav aria-label="Explore AROORAA">
          <h2 className={styles.heading}>Explore AROORAA</h2>
          <ul>
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link prefetch={false} href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="On this page">
          <h2 className={styles.heading}>On this page</h2>
          <ul>
            {PAGE_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.heading}>Contact</h2>
          <ul>
            <li>
              <a href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phoneDisplay}</a>
            </li>
            <li>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`${ui.shell} ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} AROORAA Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
}
