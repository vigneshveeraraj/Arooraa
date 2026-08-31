import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "./BrandLogo";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SERVICE_LINKS,
  LEGAL_LINKS,
  SOCIAL_LINKS,
  START_PROJECT_LINK,
} from "@/lib/content/navigation";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link href="/" aria-label="AROORAA — home">
              <BrandLogo size="footer" />
            </Link>
            <p className={`text-body-sm ${styles.tagline}`}>
              AROORAA turns ideas and business problems into production-ready digital products.
            </p>
            {/* Lower-emphasis than the Final CTA above it — that section is the
                intentional conversion moment; the footer just keeps the path
                open (polish brief §8). */}
            <Button href={START_PROJECT_LINK.href} variant="ghost">
              {START_PROJECT_LINK.label}
            </Button>
          </div>

          <nav aria-label="Products" className={styles.col}>
            <p className={`text-label ${styles.colTitle}`}>Products</p>
            <ul className={styles.linkList}>
              {FOOTER_PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className={styles.col}>
            <p className={`text-label ${styles.colTitle}`}>Services</p>
            <ul className={styles.linkList}>
              {FOOTER_SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className={styles.col}>
            <p className={`text-label ${styles.colTitle}`}>Company</p>
            <ul className={styles.linkList}>
              {FOOTER_COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span className="text-body-sm">© {year} AROORAA</span>

          {LEGAL_LINKS.length > 0 ? (
            <ul className={styles.inlineList}>
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          ) : null}

          {SOCIAL_LINKS.length > 0 ? (
            <ul className={styles.inlineList}>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
