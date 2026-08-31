import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { START_PROJECT_HERO } from "@/lib/content/start-project";
import styles from "./StartProjectHero.module.css";

/**
 * The Start Project hero (W3.2A §3) — a plain anchor to #start-project-form,
 * which the form itself exposes as a focusable (tabIndex=-1) target, so the
 * jump both scrolls and moves focus without any extra client-side script.
 */
export function StartProjectHero() {
  return (
    <Section id="hero" spacing="default">
      <Container width="content">
        <Eyebrow>{START_PROJECT_HERO.eyebrow}</Eyebrow>
        <h1 className={`text-display ${styles.headline}`}>{START_PROJECT_HERO.heading}</h1>
        <p className={`text-body-lg ${styles.supporting}`}>{START_PROJECT_HERO.supporting}</p>
        <p className={styles.reassurance}>{START_PROJECT_HERO.reassurance}</p>
        <Button href="#start-project-form" variant="primary">
          {START_PROJECT_HERO.primaryCta}
        </Button>
      </Container>
    </Section>
  );
}
