import { Container } from "@/components/ui/Container";
import { CAREERS_IN_PAGE_NAV } from "@/lib/content/careers";
import styles from "./CareersInPageNav.module.css";

/** Optional in-page nav (W3.3A §44) — anchors within /careers only, never
 * added to the global header. */
export function CareersInPageNav() {
  return (
    <nav aria-label="Careers page sections" className={styles.nav}>
      <Container>
        <ul className={styles.list}>
          {CAREERS_IN_PAGE_NAV.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
