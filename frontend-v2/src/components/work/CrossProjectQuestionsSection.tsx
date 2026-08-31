import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CROSS_PROJECT_HEADING, CROSS_PROJECT_QUESTIONS, WORK_STORIES } from "@/lib/content/our-work";
import styles from "./CrossProjectQuestionsSection.module.css";

function productName(slug: string) {
  return WORK_STORIES.find((story) => story.slug === slug)?.title ?? slug;
}

/**
 * The cross-project section (W1 §20) — deliberately not a filled-in
 * spreadsheet: each question is a large editorial line with its own number,
 * followed only by the (hand-curated, not exhaustive) product names it's
 * most relevant to, as small scattered tags rather than ticked-off grid
 * cells. The message is "the domain changes, the questions repeat," not
 * "here is a complete feature matrix."
 */
export function CrossProjectQuestionsSection() {
  return (
    <Section id="cross-project" spacing="default">
      <Container width="wide">
        <SectionHeading
          eyebrow={CROSS_PROJECT_HEADING.eyebrow}
          title={CROSS_PROJECT_HEADING.title}
          description={CROSS_PROJECT_HEADING.description}
        />
        <ol className={styles.list}>
          {CROSS_PROJECT_QUESTIONS.map((item, index) => (
            <li key={item.question} className={styles.row}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.content}>
                <span className={`text-h4 ${styles.question}`}>{item.question}</span>
                <span className={styles.tags}>
                  {item.relevantTo.map((slug) => (
                    <span key={slug} className={styles.tag}>
                      {productName(slug)}
                    </span>
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
