import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { INSIGHTS_HERO } from "@/lib/content/insights";
import styles from "./InsightsHero.module.css";

export function InsightsHero() {
  return (
    <Section spacing="default">
      <Container width="content">
        <div className={styles.hero}>
          <Eyebrow>{INSIGHTS_HERO.eyebrow}</Eyebrow>
          <h1 className={`text-display ${styles.headline}`}>{INSIGHTS_HERO.headline}</h1>
          <p className={`text-body-lg ${styles.supporting}`}>{INSIGHTS_HERO.supporting}</p>
        </div>
      </Container>
    </Section>
  );
}
