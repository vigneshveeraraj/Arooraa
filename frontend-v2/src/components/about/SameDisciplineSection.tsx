import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SAME_DISCIPLINE } from "@/lib/content/about";
import styles from "./SameDisciplineSection.module.css";

/** Chapter 03 — Different problems, same discipline (W3.1 §9). */
export function SameDisciplineSection() {
  return (
    <Section id="discipline" spacing="default">
      <Container width="content">
        <SectionHeading title={SAME_DISCIPLINE.heading} description={SAME_DISCIPLINE.intro} />
        <p className={`text-body-lg ${styles.disciplineIntro}`}>{SAME_DISCIPLINE.disciplineIntro}</p>
        <ol className={styles.rail}>
          {SAME_DISCIPLINE.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className={`text-h3 ${styles.timeBack}`}>{SAME_DISCIPLINE.timeBackLine}</p>
      </Container>
    </Section>
  );
}
