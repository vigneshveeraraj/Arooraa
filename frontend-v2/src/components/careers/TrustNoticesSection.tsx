import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { EQUAL_OPPORTUNITY_CONTENT, RECRUITMENT_SAFETY_CONTENT } from "@/lib/content/careers";
import styles from "./TrustNoticesSection.module.css";

/** Recruitment safety (W3.3A §33) and equal-opportunity language (§34) —
 * two short, restrained notices near the bottom of the page. */
export function TrustNoticesSection() {
  return (
    <Section spacing="compact">
      <Container>
        <div className={styles.grid}>
          <div className={styles.notice}>
            <h3 className="text-h4">{RECRUITMENT_SAFETY_CONTENT.title}</h3>
            <p className={`text-body-sm ${styles.body}`}>{RECRUITMENT_SAFETY_CONTENT.body}</p>
          </div>
          <div className={styles.notice}>
            <h3 className="text-h4">{EQUAL_OPPORTUNITY_CONTENT.title}</h3>
            <p className={`text-body-sm ${styles.body}`}>{EQUAL_OPPORTUNITY_CONTENT.body}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
