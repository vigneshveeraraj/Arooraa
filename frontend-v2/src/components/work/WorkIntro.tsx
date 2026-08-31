import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { WORK_INTRO } from "@/lib/content/our-work";
import styles from "./WorkIntro.module.css";

/**
 * The short editorial transition after the hero (W1) — a credibility
 * statement, not a section with lists or visuals. Deliberately centered and
 * compact so it reads as a pause/breath before the first project story,
 * contributing to the page's required visual rhythm (brief §23).
 */
export function WorkIntro() {
  return (
    <Section id="philosophy" spacing="compact">
      <Container width="content">
        <div className={styles.block}>
          <h2 className={`text-h2 ${styles.title}`}>{WORK_INTRO.title}</h2>
          <p className={`text-body-lg ${styles.body}`}>{WORK_INTRO.body}</p>
        </div>
      </Container>
    </Section>
  );
}
