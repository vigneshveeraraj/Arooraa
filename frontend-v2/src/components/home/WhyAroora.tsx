import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DIFFERENTIATORS, WHY_AROORAA_HEADING } from "@/lib/content/why-arooraa";
import styles from "./WhyAroora.module.css";

export function WhyAroora() {
  return (
    <Section spacing="compact">
      <Container>
        <SectionHeading eyebrow={WHY_AROORAA_HEADING.eyebrow} title={WHY_AROORAA_HEADING.title} />

        <div className={styles.grid}>
          {DIFFERENTIATORS.map((item) => (
            <div key={item.number} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {item.number}
              </span>
              <div className={styles.itemContent}>
                <p className="text-h4">{item.title}</p>
                <p className={`text-body-sm ${styles.description}`}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
