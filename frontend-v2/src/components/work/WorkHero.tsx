import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ProjectConstellationVisual } from "./ProjectConstellationVisual";
import { WORK_HERO } from "@/lib/content/our-work";
import styles from "./WorkHero.module.css";

export function WorkHero() {
  return (
    <Section id="hero" spacing="default">
      <Container width="wide">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Eyebrow>{WORK_HERO.eyebrow}</Eyebrow>
            <h1 className={`text-display ${styles.headline}`}>{WORK_HERO.title}</h1>
            <p className={`text-body-lg ${styles.supporting}`}>{WORK_HERO.supporting}</p>
            <p className={`text-body ${styles.supportingLine}`}>{WORK_HERO.supportingLine}</p>
            <div className={styles.actions}>
              <Button href={WORK_HERO.primaryCta.href} variant="primary">
                {WORK_HERO.primaryCta.label}
              </Button>
              <Button href={WORK_HERO.secondaryCta.href} variant="secondary">
                {WORK_HERO.secondaryCta.label}
              </Button>
            </div>
          </div>
          <div className={styles.visual}>
            <ProjectConstellationVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
