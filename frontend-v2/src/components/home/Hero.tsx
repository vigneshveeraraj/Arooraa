import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { HERO_CONTENT } from "@/lib/content/home";
import { HeroVisual } from "./HeroVisual";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <Section spacing="default" className={styles.hero}>
      <Container>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <Eyebrow>{HERO_CONTENT.eyebrow}</Eyebrow>
            <h1 className={`text-h1 ${styles.headline}`}>{HERO_CONTENT.headline}</h1>
            <p className={`text-body-lg ${styles.supporting}`}>{HERO_CONTENT.supporting}</p>

            <div className={styles.ctaRow}>
              <Button href={HERO_CONTENT.primaryCta.href} variant="primary">
                {HERO_CONTENT.primaryCta.label}
              </Button>
              <Button href={HERO_CONTENT.secondaryCta.href} variant="secondary">
                {HERO_CONTENT.secondaryCta.label}
              </Button>
            </div>

            <p className={styles.productStrip} data-testid="hero-product-strip">
              {HERO_CONTENT.productLabels.map((label, index) => (
                <span key={label} className={styles.productLabel}>
                  {label}
                  {index < HERO_CONTENT.productLabels.length - 1 ? (
                    <span className={styles.dot} aria-hidden="true">
                      {" "}
                      •{" "}
                    </span>
                  ) : null}
                </span>
              ))}
            </p>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <HeroVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
