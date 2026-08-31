import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ABOUT_CLOSING } from "@/lib/content/about";
import { AboutClosingVisual } from "./AboutClosingVisual";
import styles from "./AboutClosingStory.module.css";

/**
 * The page's closing (W3.1 §20) — the left/right editorial split pattern
 * established for the /our-work/* product stories' closing sections (W2.2A
 * onward), reused here rather than reinvented.
 */
export function AboutClosingStory() {
  return (
    <Section id="closing" tone="dark" spacing="default">
      <Container width="wide">
        <div className={styles.split}>
          <div className={styles.copy}>
            <h2 className={`text-h1 ${styles.heading}`}>{ABOUT_CLOSING.heading}</h2>
            <p className={`text-body-lg ${styles.supporting}`}>{ABOUT_CLOSING.supporting}</p>
            <p className={styles.principle}>{ABOUT_CLOSING.principle}</p>
            <div className={styles.actions}>
              <Button href={ABOUT_CLOSING.primaryCta.href} variant="primary">
                {ABOUT_CLOSING.primaryCta.label}
              </Button>
              <Button href={ABOUT_CLOSING.secondaryCta.href} variant="secondary">
                {ABOUT_CLOSING.secondaryCta.label}
              </Button>
            </div>
          </div>
          <div className={styles.visual}>
            <AboutClosingVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
