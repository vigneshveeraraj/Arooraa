import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ABOUT_PHILOSOPHY } from "@/lib/content/about";
import { AboutSpark } from "./AboutSpark";
import styles from "./AboutPhilosophyBand.module.css";

/**
 * A short pull-quote beat between the hero and Chapter 01 (W3.1 §1) — carries
 * the core positioning and the "starts where someone says there should be a
 * better way" philosophy once, prominently, rather than repeating it
 * mechanically through the rest of the page.
 */
export function AboutPhilosophyBand() {
  return (
    <Section id="philosophy" spacing="compact">
      <Container width="content">
        <div className={styles.wrap}>
          <p className={`text-eyebrow ${styles.label}`}>{ABOUT_PHILOSOPHY.label}</p>
          <p className={`text-body-lg ${styles.proposition}`}>{ABOUT_PHILOSOPHY.proposition}</p>
          <div className={styles.quoteRow}>
            <AboutSpark size={28} className={styles.quoteSpark} />
            <p className={`text-h2 ${styles.quote}`}>{ABOUT_PHILOSOPHY.quote}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
