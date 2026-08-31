import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PRODUCTS_CTA_CONTENT } from "@/lib/content/products";
import styles from "./ProductsCta.module.css";

export function ProductsCta() {
  return (
    <Section tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={PRODUCTS_CTA_CONTENT.title} align="center" />
        <div className={styles.actions}>
          <Button href={PRODUCTS_CTA_CONTENT.cta.href} variant="primary">
            {PRODUCTS_CTA_CONTENT.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
