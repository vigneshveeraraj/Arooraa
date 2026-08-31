import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PRODUCTS_SNAPSHOT, PRODUCTS_SNAPSHOT_HEADING } from "@/lib/content/home";
import styles from "./ProductsSnapshot.module.css";

export function ProductsSnapshot() {
  return (
    <Section spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={PRODUCTS_SNAPSHOT_HEADING.eyebrow}
          title={PRODUCTS_SNAPSHOT_HEADING.title}
          description={PRODUCTS_SNAPSHOT_HEADING.description}
        />

        <div className={styles.grid}>
          {PRODUCTS_SNAPSHOT.map((product) => (
            <Card
              key={product.id}
              interactive
              className={`${styles.card} ${product.featured ? styles.featured : ""}`}
            >
              <div className={styles.cardHeader}>
                <p className="text-h3">{product.name}</p>
                {product.status ? <Badge variant="accent">{product.status}</Badge> : null}
              </div>
              <p className={`text-label ${styles.positioning}`}>{product.positioning}</p>
              <p className={`text-body-sm ${styles.description}`}>{product.description}</p>
              <Link href={product.href} className={styles.exploreLink}>
                {`Explore ${product.name}`}
                <span aria-hidden="true"> →</span>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
