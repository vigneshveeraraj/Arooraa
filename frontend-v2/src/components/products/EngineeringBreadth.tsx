import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ENGINEERING_BREADTH_CONTENT } from "@/lib/content/products";
import styles from "./EngineeringBreadth.module.css";

export function EngineeringBreadth() {
  return (
    <Section spacing="compact" className={styles.engineeringBreadth}>
      <Container>
        <SectionHeading
          eyebrow={ENGINEERING_BREADTH_CONTENT.eyebrow}
          title={ENGINEERING_BREADTH_CONTENT.title}
          align="center"
        />
        <div className={styles.grid}>
          {ENGINEERING_BREADTH_CONTENT.domains.map((item) => (
            <div key={item.product} className={styles.item}>
              <p className={`text-label ${styles.product}`}>{item.product}</p>
              <p className="text-h4">{item.domain}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
