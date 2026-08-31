import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FINAL_CTA_CONTENT } from "@/lib/content/cta";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <Section tone="dark" spacing="default" className={styles.finalCta}>
      <Container width="content">
        <SectionHeading title={FINAL_CTA_CONTENT.title} description={FINAL_CTA_CONTENT.supporting} align="center" />

        <div className={styles.actions}>
          <Button href={FINAL_CTA_CONTENT.primary.href} variant="primary">
            {FINAL_CTA_CONTENT.primary.label}
          </Button>
          <Button href={FINAL_CTA_CONTENT.secondary.href} variant="secondary">
            {FINAL_CTA_CONTENT.secondary.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
