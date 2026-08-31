import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { CONTACT_HERO, START_PROJECT_REDIRECT } from "@/lib/content/contact";
import styles from "./ContactHero.module.css";

/**
 * The hero plus the Start-a-Project redirect (W3.4 §2) — kept in the same section so a
 * high-intent visitor sees the faster path before ever reaching the (smaller, general) form
 * below, preventing project enquiries from being lost in Contact.
 */
export function ContactHero() {
  return (
    <Section spacing="default">
      <Container width="content">
        <div className={styles.wrap}>
          <Eyebrow>{CONTACT_HERO.eyebrow}</Eyebrow>
          <h1 className={`text-h1 ${styles.headline}`}>{CONTACT_HERO.headline}</h1>
          <p className={`text-body-lg ${styles.supporting}`}>{CONTACT_HERO.supporting}</p>

          <div className={styles.redirect}>
            <p className={`text-h4 ${styles.redirectTitle}`}>{START_PROJECT_REDIRECT.title}</p>
            <p className={`text-body-sm ${styles.redirectBody}`}>{START_PROJECT_REDIRECT.body}</p>
            <Button href={START_PROJECT_REDIRECT.cta.href} variant="secondary">
              {START_PROJECT_REDIRECT.cta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
