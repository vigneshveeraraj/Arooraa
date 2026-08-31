import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  OWN_PRODUCT_PROOF_CTA,
  OWN_PRODUCT_PROOF_LINE,
  OWN_PRODUCT_PROOF_PRODUCTS,
} from "@/lib/content/start-project";
import styles from "./OwnProductProofSection.module.css";

/**
 * One restrained trust band (W3.2A §31) — Start Project is not another Our
 * Work page, so this stays to a single line plus a plain product-name list.
 */
export function OwnProductProofSection() {
  return (
    <Section id="own-product-proof" tone="dark" spacing="compact">
      <Container width="content">
        <p className={`text-body-lg ${styles.line}`}>{OWN_PRODUCT_PROOF_LINE}</p>
        <ul className={styles.products}>
          {OWN_PRODUCT_PROOF_PRODUCTS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <Button href={OWN_PRODUCT_PROOF_CTA.href} variant="secondary">
          {OWN_PRODUCT_PROOF_CTA.label}
        </Button>
      </Container>
    </Section>
  );
}
