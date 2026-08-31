import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WORK_PRINCIPLES, WORK_PRINCIPLES_HEADING } from "@/lib/content/our-work";
import styles from "./WorkPrinciples.module.css";

/**
 * "What building taught us" (W1 §22) — five observations laid out as a
 * staggered editorial list (alternating indent, large numerals), not five
 * equal cards. Framed explicitly as AROORAA's own perspective, not a
 * universal claim, matching the heading's own description text.
 */
export function WorkPrinciples() {
  return (
    <Section id="what-we-learned" spacing="default">
      <Container width="content">
        <SectionHeading
          eyebrow={WORK_PRINCIPLES_HEADING.eyebrow}
          title={WORK_PRINCIPLES_HEADING.title}
          description={WORK_PRINCIPLES_HEADING.description}
        />
        <ol className={styles.list}>
          {WORK_PRINCIPLES.map((principle, index) => (
            <li key={principle.title} className={`${styles.item} ${index % 2 === 1 ? styles.itemAlt : ""}`}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={`text-h3 ${styles.itemTitle}`}>{principle.title}</h3>
                <p className={`text-body ${styles.itemBody}`}>{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
