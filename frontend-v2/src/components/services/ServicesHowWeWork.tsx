import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DELIVERY_STAGES } from "@/lib/content/process";
import { SERVICES_HOW_WE_WORK_HEADING } from "@/lib/content/services";
import styles from "./ServicesHowWeWork.module.css";

/**
 * A compact restatement of the shared nine-stage delivery lifecycle (S1) —
 * reuses DELIVERY_STAGES from process.ts as-is (same data the homepage's
 * HowWeWork renders), per the brief's explicit "do not create a new process
 * model." Only the heading and the visual density differ: stage names only,
 * in a single wrapped row, instead of the homepage's full numbered timeline
 * with descriptions.
 */
export function ServicesHowWeWork() {
  return (
    <Section id="how-we-work" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={SERVICES_HOW_WE_WORK_HEADING.eyebrow}
          title={SERVICES_HOW_WE_WORK_HEADING.title}
          description={SERVICES_HOW_WE_WORK_HEADING.description}
        />

        <ol className={styles.stages}>
          {DELIVERY_STAGES.map((stage) => (
            <li key={stage.number} className={styles.stage}>
              {stage.name}
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
