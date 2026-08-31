import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HIRING_PROCESS_CONTENT } from "@/lib/content/careers";
import styles from "./HiringProcessSection.module.css";

export function HiringProcessSection() {
  return (
    <Section id="hiring-process" tone="dark">
      <Container>
        <SectionHeading
          eyebrow={HIRING_PROCESS_CONTENT.eyebrow}
          title={HIRING_PROCESS_CONTENT.title}
          description={HIRING_PROCESS_CONTENT.description}
        />

        <ol className={styles.steps}>
          {HIRING_PROCESS_CONTENT.steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </span>
              <h3 className="text-h4">{step.title}</h3>
              <p className={`text-body-sm ${styles.stepBody}`}>{step.body}</p>
            </li>
          ))}
        </ol>

        <div className={styles.respect}>
          <p className="text-h3">{HIRING_PROCESS_CONTENT.candidateRespect.title}</p>
          <p className={`text-body-lg ${styles.respectBody}`}>{HIRING_PROCESS_CONTENT.candidateRespect.body}</p>
        </div>
      </Container>
    </Section>
  );
}
