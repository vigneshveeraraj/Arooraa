import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ABOUT_HERO } from "@/lib/content/about";
import { AboutHeroVisual } from "./AboutHeroVisual";
import styles from "./AboutHero.module.css";

/**
 * The About page's own hero (W3.1 §3–4) — deliberately not the shared
 * WorkDetailHero (which always carries a maturity badge for a product
 * story). About is a company/philosophy page, not a product story, so it
 * gets its own bright, badge-free hero built from the same generic
 * Section/Container/Button primitives.
 */
export function AboutHero() {
  return (
    <Section id="hero" spacing="default">
      <Container width="wide">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <Eyebrow>{ABOUT_HERO.eyebrow}</Eyebrow>
            <h1 className={`text-display ${styles.headline}`}>{ABOUT_HERO.headline}</h1>
            {ABOUT_HERO.supporting.map((paragraph) => (
              <p key={paragraph} className={`text-body-lg ${styles.supporting}`}>
                {paragraph}
              </p>
            ))}
            <div className={styles.actions}>
              <Button href={ABOUT_HERO.primaryCta.href} variant="primary">
                {ABOUT_HERO.primaryCta.label}
              </Button>
              <Button href={ABOUT_HERO.secondaryCta.href} variant="secondary">
                {ABOUT_HERO.secondaryCta.label}
              </Button>
            </div>
          </div>
          <div className={styles.visual}>
            <AboutHeroVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
