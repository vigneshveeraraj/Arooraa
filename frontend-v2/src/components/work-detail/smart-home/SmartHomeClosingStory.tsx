import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { CLOSING_PRINCIPLE, SMART_HOME_STORY_CLOSING } from "@/lib/content/work-detail/smart-home";
import { SmartHomeClosingVisual } from "./SmartHomeClosingVisual";
import styles from "./SmartHomeClosingStory.module.css";

/**
 * The closing story — an unnumbered reflective section before the final
 * CTA, distinct from it: this states why Arooraa Smart Home exists one
 * last time and shows the closing visual; the CTA immediately after is
 * the actual invitation to start a project, with its own separate title.
 * A single-row editorial split (copy and visual side by side, reversed at
 * mobile so the copy still reads first) rather than a stacked, mostly
 * empty layout. This is the page's second dark section (with Chapter 9 —
 * Safety), within the brief's one-or-two-dark-sections allowance.
 */
export function SmartHomeClosingStory() {
  return (
    <Section id="closing-story" tone="dark" spacing="default">
      <Container width="wide">
        <div className={styles.split}>
          <div className={styles.copy}>
            <h2 className={`text-h2 ${styles.heading}`}>{SMART_HOME_STORY_CLOSING.title}</h2>
            <p className={`text-body-lg ${styles.supporting}`}>{SMART_HOME_STORY_CLOSING.supporting}</p>
            <p className={styles.principle}>{CLOSING_PRINCIPLE}</p>
          </div>
          <div className={styles.visual}>
            <SmartHomeClosingVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
