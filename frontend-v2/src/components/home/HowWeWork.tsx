import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DELIVERY_STAGES, HOW_WE_WORK_HEADING } from "@/lib/content/process";
import styles from "./HowWeWork.module.css";

export function HowWeWork() {
  return (
    <Section tone="dark" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={HOW_WE_WORK_HEADING.eyebrow}
          title={HOW_WE_WORK_HEADING.title}
          description={HOW_WE_WORK_HEADING.description}
        />

        <ol className={styles.timeline}>
          {DELIVERY_STAGES.map((stage) => (
            <li key={stage.number} className={styles.stage}>
              <div className={styles.stageMarker}>
                <span className={styles.stageNumber} aria-hidden="true">
                  {stage.number}
                </span>
              </div>
              <div className={styles.stageContent}>
                <p className="text-h4" data-testid="stage-name">
                  {stage.name}
                </p>
                <p className={`text-body-sm ${styles.stageDescription}`}>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
