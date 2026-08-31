import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WORK_FINAL_CTA } from "@/lib/content/our-work";
import styles from "./WorkFinalCta.module.css";

export function WorkFinalCta() {
  return (
    <Section id="cta" tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={WORK_FINAL_CTA.title} description={WORK_FINAL_CTA.supporting} align="center" />
        <div className={styles.actions}>
          <Button href={WORK_FINAL_CTA.primary.href} variant="primary">
            {WORK_FINAL_CTA.primary.label}
          </Button>
          <Button href={WORK_FINAL_CTA.secondary.href} variant="secondary">
            {WORK_FINAL_CTA.secondary.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
