import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { MINDRA_STORY_CLOSING } from "@/lib/content/work-detail/mindra";
import { MindraOrbitClosingVisual } from "./MindraOrbitClosingVisual";
import styles from "./MindraClosingStory.module.css";

/**
 * The closing story — an unnumbered reflective section before the final
 * CTA, distinct from it: this states why Mindra exists one last time and
 * shows the human-centered orbit; the CTA immediately after is the actual
 * invitation to start a project, with its own separate title.
 */
export function MindraClosingStory() {
  return (
    <Section id="closing-story" spacing="default">
      <Container width="content">
        <div className={styles.head}>
          <h2 className={`text-h2 ${styles.heading}`}>{MINDRA_STORY_CLOSING.title}</h2>
          <p className={`text-body-lg ${styles.supporting}`}>{MINDRA_STORY_CLOSING.supporting}</p>
        </div>
      </Container>
      <Container width="wide">
        <MindraOrbitClosingVisual />
      </Container>
    </Section>
  );
}
