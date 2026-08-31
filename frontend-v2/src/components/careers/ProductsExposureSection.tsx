import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS } from "@/lib/content/products";
import { PRODUCTS_EXPOSURE_CONTENT } from "@/lib/content/careers";
import styles from "./ProductsExposureSection.module.css";

/**
 * "Products you may work on" (W3.3A §18) — reuses the same PRODUCTS list
 * the Products Index reads, rather than re-describing MESA/Mindra/Smart
 * Mirror/Arooraa Smart Home a second time with content that could drift.
 */
export function ProductsExposureSection() {
  return (
    <Section tone="dark" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={PRODUCTS_EXPOSURE_CONTENT.eyebrow}
          title={PRODUCTS_EXPOSURE_CONTENT.title}
          description={PRODUCTS_EXPOSURE_CONTENT.description}
        />

        <ul className={styles.grid}>
          {PRODUCTS.map((product) => (
            <li key={product.id} className={styles.card}>
              <Link href={product.href} className={styles.link}>
                <h3 className="text-h4">{product.name}</h3>
                <p className={`text-body-sm ${styles.positioning}`}>{product.positioning}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
