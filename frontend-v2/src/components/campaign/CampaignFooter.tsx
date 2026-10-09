import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CAMPAIGN_CONTACT, CAMPAIGN_PAGE_LINKS, CAMPAIGN_SITE_LINKS, FOOTER } from "@/lib/content/grow-your-business";
import styles from "./CampaignFooter.module.css";

/** Light footer, like the main site's, so the full-colour logo stays legible. */
export function CampaignFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" prefetch={false} aria-label="AROORAA — main website" className={styles.logoLink}>
            <BrandLogo size="footer" />
          </Link>
          <p lang="ta">{FOOTER.tagline}</p>
        </div>
        <nav aria-label="Explore AROORAA">
          <h2>Explore AROORAA</h2>
          <ul>
            {CAMPAIGN_SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} prefetch={false}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="On this page">
          <h2>On this page</h2>
          <ul>
            {CAMPAIGN_PAGE_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2>Contact</h2>
          <ul>
            <li>
              <a href={`tel:${CAMPAIGN_CONTACT.phoneE164}`}>{CAMPAIGN_CONTACT.phoneDisplay}</a>
            </li>
            <li>
              <a href={CAMPAIGN_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${CAMPAIGN_CONTACT.email}`}>{CAMPAIGN_CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.legal}>
        <p>© {new Date().getFullYear()} AROORAA Technologies Private Limited. All rights reserved.</p>
        <p>{FOOTER.conceptsNote}</p>
      </div>
    </footer>
  );
}
