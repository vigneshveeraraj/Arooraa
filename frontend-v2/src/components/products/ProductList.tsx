import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PRODUCTS } from "@/lib/content/products";
import styles from "./ProductList.module.css";

export function ProductList() {
  return (
    <Section spacing="compact">
      <Container>
        <div className={styles.list}>
          {PRODUCTS.map((product) => (
            <article key={product.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h2 className="text-h2">{product.name}</h2>
                {product.status ? <Badge variant="accent">{product.status}</Badge> : null}
              </div>
              <p className={`text-label ${styles.positioning}`}>{product.positioning}</p>
              <p className={`text-body ${styles.description}`}>{product.description}</p>
              <div className={styles.focusRow}>
                {product.engineeringFocus.map((focus) => (
                  <Badge key={focus} variant="neutral">
                    {focus}
                  </Badge>
                ))}
              </div>
              <Link href={product.href} className={styles.exploreLink}>
                {`Explore ${product.name}`}
                <span aria-hidden="true"> →</span>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
