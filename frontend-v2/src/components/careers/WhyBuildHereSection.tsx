import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WHY_AROORAA_CONTENT } from "@/lib/content/careers";
import styles from "./WhyBuildHereSection.module.css";

export function WhyBuildHereSection() {
  return (
    <Section id="why-arooraa">
      <Container>
        <SectionHeading eyebrow={WHY_AROORAA_CONTENT.eyebrow} title={WHY_AROORAA_CONTENT.title} />

        <ul className={styles.grid}>
          {WHY_AROORAA_CONTENT.reasons.map((reason) => (
            <li key={reason.title} className={styles.item}>
              <h3 className="text-h4">{reason.title}</h3>
              <p className={`text-body-sm ${styles.body}`}>{reason.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
