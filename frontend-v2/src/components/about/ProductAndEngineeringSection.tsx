import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCT_AND_ENGINEERING } from "@/lib/content/about";
import { ProductEngineeringOrbitVisual } from "./ProductEngineeringOrbitVisual";
import styles from "./ProductAndEngineeringSection.module.css";

/** Chapter 06 — Product thinking + engineering (W3.1 §12). */
export function ProductAndEngineeringSection() {
  return (
    <Section id="product-engineering" spacing="default">
      <Container width="wide">
        <SectionHeading title={PRODUCT_AND_ENGINEERING.heading} />
        <div className={styles.body}>
          {PRODUCT_AND_ENGINEERING.bodyLines.map((line) => (
            <p key={line} className="text-body-lg">
              {line}
            </p>
          ))}
        </div>
        <ProductEngineeringOrbitVisual />
        <p className={`text-h3 ${styles.principle}`}>{PRODUCT_AND_ENGINEERING.strongPrinciple}</p>
      </Container>
    </Section>
  );
}
