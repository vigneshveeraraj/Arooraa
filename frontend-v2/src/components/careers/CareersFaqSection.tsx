import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CAREERS_FAQ_CONTENT } from "@/lib/content/careers";
import styles from "./CareersFaqSection.module.css";

export function CareersFaqSection() {
  return (
    <Section spacing="compact">
      <Container width="content">
        <SectionHeading eyebrow={CAREERS_FAQ_CONTENT.eyebrow} title={CAREERS_FAQ_CONTENT.title} />

        <dl className={styles.list}>
          {CAREERS_FAQ_CONTENT.items.map((item) => (
            <div key={item.question} className={styles.item}>
              <dt className="text-h4">{item.question}</dt>
              <dd className={`text-body-sm ${styles.answer}`}>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
