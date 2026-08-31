import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { CAREERS_HERO } from "@/lib/content/careers";
import { CareersHeroVisual } from "./CareersHeroVisual";
import styles from "./CareersHero.module.css";

export function CareersHero() {
  return (
    <Section spacing="default">
      <Container>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <Eyebrow>{CAREERS_HERO.eyebrow}</Eyebrow>
            <h1 className={`text-h1 ${styles.headline}`}>{CAREERS_HERO.headline}</h1>
            <p className={`text-body-lg ${styles.supporting}`}>{CAREERS_HERO.supporting}</p>

            <div className={styles.ctaRow}>
              <Button href={CAREERS_HERO.primaryCta.href} variant="primary">
                {CAREERS_HERO.primaryCta.label}
              </Button>
              <Button href={CAREERS_HERO.secondaryCta.href} variant="secondary">
                {CAREERS_HERO.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <CareersHeroVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
