import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { InsightClosingCta as InsightClosingCtaContent } from "@/lib/insights/types";
import styles from "./InsightClosingCta.module.css";

interface InsightClosingCtaProps {
  content: InsightClosingCtaContent;
}

/**
 * One restrained closing CTA (Phase 14) — reused on the index (generic) and
 * every article page (per-article, chosen by editorial context). Never more
 * than a single primary action, so an article never reads as an advertisement.
 */
export function InsightClosingCta({ content }: InsightClosingCtaProps) {
  return (
    <Section tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={content.title} description={content.body} align="center" />
        <div className={styles.actions}>
          <Button href={content.ctaHref} variant="primary">
            {content.ctaLabel}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
