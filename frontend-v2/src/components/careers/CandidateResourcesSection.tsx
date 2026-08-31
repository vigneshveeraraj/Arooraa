import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CANDIDATE_RESOURCES_CONTENT } from "@/lib/content/careers";
import styles from "./CandidateResourcesSection.module.css";

/**
 * Candidate Guide (W3.3A §22) — expands inline via native <details>, rather
 * than linking to content pages that don't exist yet (the brief is explicit:
 * no empty/broken routes).
 */
export function CandidateResourcesSection() {
  return (
    <Section spacing="compact">
      <Container>
        <SectionHeading eyebrow={CANDIDATE_RESOURCES_CONTENT.eyebrow} title={CANDIDATE_RESOURCES_CONTENT.title} />

        <div className={styles.list}>
          {CANDIDATE_RESOURCES_CONTENT.items.map((item) => (
            <details key={item.id} className={styles.item}>
              <summary className={`text-h4 ${styles.summary}`}>{item.title}</summary>
              <p className={`text-body-sm ${styles.body}`}>{item.body}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
