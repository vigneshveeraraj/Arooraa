import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WORKING_PRINCIPLES_CONTENT } from "@/lib/content/careers";
import styles from "./WorkingPrinciplesSection.module.css";

export function WorkingPrinciplesSection() {
  return (
    <Section id="how-we-work">
      <Container>
        <SectionHeading
          eyebrow={WORKING_PRINCIPLES_CONTENT.eyebrow}
          title={WORKING_PRINCIPLES_CONTENT.title}
          description={WORKING_PRINCIPLES_CONTENT.description}
        />

        <ol className={styles.list}>
          {WORKING_PRINCIPLES_CONTENT.principles.map((principle, index) => (
            <li key={principle.title} className={styles.item}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-h4">{principle.title}</h3>
                <p className={`text-body-sm ${styles.body}`}>{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
