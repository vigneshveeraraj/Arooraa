import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SERVICES_INDEX_CTA } from "@/lib/content/services";
import styles from "./ServicesFinalCta.module.css";

export function ServicesFinalCta() {
  return (
    <Section id="cta" tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={SERVICES_INDEX_CTA.title} description={SERVICES_INDEX_CTA.supporting} align="center" />
        <div className={styles.actions}>
          <Button href={SERVICES_INDEX_CTA.primary.href} variant="primary">
            {SERVICES_INDEX_CTA.primary.label}
          </Button>
          <Button href={SERVICES_INDEX_CTA.secondary.href} variant="secondary">
            {SERVICES_INDEX_CTA.secondary.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
