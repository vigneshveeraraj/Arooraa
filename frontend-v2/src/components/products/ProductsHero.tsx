import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PRODUCTS_INDEX_HEADING } from "@/lib/content/products";
import styles from "./ProductsHero.module.css";

export function ProductsHero() {
  return (
    <Section spacing="default">
      <Container width="content">
        <div className={styles.hero}>
          <Eyebrow>{PRODUCTS_INDEX_HEADING.eyebrow}</Eyebrow>
          <h1 className="text-display">{PRODUCTS_INDEX_HEADING.title}</h1>
          <p className="text-body-lg">{PRODUCTS_INDEX_HEADING.description}</p>
        </div>
      </Container>
    </Section>
  );
}
