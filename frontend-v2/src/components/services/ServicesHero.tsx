import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { SERVICES_INDEX_HERO } from "@/lib/content/services";
import styles from "./ServicesHero.module.css";

export function ServicesHero() {
  return (
    <Section id="hero" spacing="default">
      <Container width="content">
        <div className={styles.hero}>
          <Eyebrow>{SERVICES_INDEX_HERO.eyebrow}</Eyebrow>
          <h1 className="text-display">{SERVICES_INDEX_HERO.title}</h1>
          <p className="text-body-lg">{SERVICES_INDEX_HERO.supporting}</p>
          <div className={styles.ctaRow}>
            <Button href={SERVICES_INDEX_HERO.primaryCta.href} variant="primary">
              {SERVICES_INDEX_HERO.primaryCta.label}
            </Button>
            <Button href={SERVICES_INDEX_HERO.secondaryCta.href} variant="secondary">
              {SERVICES_INDEX_HERO.secondaryCta.label}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
