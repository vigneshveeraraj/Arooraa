import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import styles from "./WorkDetailHero.module.css";

interface WorkDetailHeroProps {
  eyebrow: string;
  title: string;
  supporting: string;
  maturityLabel: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  visual: ReactNode;
  /**
   * W2.1.2 — optional, defaults to the original even 50/50 split. "wide"
   * gives the visual column more room (roughly 44/56) for a story whose hero
   * visual is a real photograph rather than a small decorative sketch.
   * Opt-in per caller, so every other /our-work/* hero stays unchanged.
   */
  visualWeight?: "balanced" | "wide";
}

/**
 * The shared hero for an Our Work engineering story (W2.1) — reusable by
 * future /our-work/* detail pages without forcing MESA's own hero visual on
 * them (the visual is entirely a caller-supplied slot). Distinct from the
 * index page's WorkHero: this one always carries a maturity badge, since
 * every engineering story needs to state honesty about status immediately.
 */
export function WorkDetailHero({
  eyebrow,
  title,
  supporting,
  maturityLabel,
  primaryCta,
  secondaryCta,
  visual,
  visualWeight = "balanced",
}: WorkDetailHeroProps) {
  return (
    <Section id="hero" spacing="default">
      <Container width="wide">
        <div className={`${styles.grid} ${visualWeight === "wide" ? styles.gridWide : ""}`}>
          <div className={styles.copy}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className={`text-display ${styles.headline}`}>{title}</h1>
            <p className={`text-body-lg ${styles.supporting}`}>{supporting}</p>
            <span className={styles.maturityBadge}>{maturityLabel}</span>
            <div className={styles.actions}>
              <Button href={primaryCta.href} variant="primary">
                {primaryCta.label}
              </Button>
              <Button href={secondaryCta.href} variant="secondary">
                {secondaryCta.label}
              </Button>
            </div>
          </div>
          <div className={styles.visual}>{visual}</div>
        </div>
      </Container>
    </Section>
  );
}
