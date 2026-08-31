import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ENGINEERING_BREADTH_CONTENT, PRODUCTS } from "@/lib/content/products";
import { SERVICES_ENGINEERING_PROOF_HEADING } from "@/lib/content/services";
import styles from "./ServicesEngineeringProof.module.css";

const ENGINEERING_CATEGORIES = [
  "Architecture",
  "Backend",
  "Frontend",
  "Mobile",
  "Data",
  "AI",
  "Cloud",
  "Security",
  "Quality",
  "Edge / Connected Systems",
];

/**
 * "We build products ourselves" (S1) — restrained proof reusing existing,
 * already-approved data: ENGINEERING_BREADTH_CONTENT (Products Index) for
 * each product's engineering domain, and PRODUCTS for its route. No product
 * copy is duplicated beyond the one-line domain already shown elsewhere; a
 * compact category badge row stands in for a full technology wall.
 */
export function ServicesEngineeringProof() {
  return (
    <Section id="product-engineering-proof" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={SERVICES_ENGINEERING_PROOF_HEADING.eyebrow}
          title={SERVICES_ENGINEERING_PROOF_HEADING.title}
          description={SERVICES_ENGINEERING_PROOF_HEADING.description}
        />

        <ul className={styles.productList}>
          {ENGINEERING_BREADTH_CONTENT.domains.map((entry) => {
            const product = PRODUCTS.find((item) => item.name === entry.product);
            return (
              <li key={entry.product} className={styles.productItem}>
                {product ? (
                  <Link href={product.href} className={styles.productName}>
                    {entry.product}
                    <span aria-hidden="true"> →</span>
                  </Link>
                ) : (
                  <p className={styles.productName}>{entry.product}</p>
                )}
                <p className={styles.productDomain}>{entry.domain}</p>
              </li>
            );
          })}
        </ul>

        <div className={styles.categoryRow}>
          {ENGINEERING_CATEGORIES.map((category) => (
            <Badge key={category} variant="neutral">
              {category}
            </Badge>
          ))}
        </div>
      </Container>
    </Section>
  );
}
