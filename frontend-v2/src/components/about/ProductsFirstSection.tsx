import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS_FIRST } from "@/lib/content/about";
import { ProductConstellationVisual } from "./ProductConstellationVisual";
import styles from "./ProductsFirstSection.module.css";

/** Chapter 02 — Products first (W3.1 §7–8). */
export function ProductsFirstSection() {
  return (
    <Section id="products-first" spacing="default">
      <Container width="wide">
        <SectionHeading title={PRODUCTS_FIRST.heading} description={PRODUCTS_FIRST.purposeLine} />
        <ProductConstellationVisual />
        <div className={styles.tradeOffs}>
          <p className={`text-h3 ${styles.strongLine}`}>{PRODUCTS_FIRST.strongLine}</p>
          <ul className={styles.list}>
            {PRODUCTS_FIRST.tradeOffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
