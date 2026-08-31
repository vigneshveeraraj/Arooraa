import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { CLOSING_PRINCIPLE, SMART_MIRROR_STORY_CLOSING } from "@/lib/content/work-detail/smart-mirror";
import { SmartMirrorClosingVisual } from "./SmartMirrorClosingVisual";
import styles from "./SmartMirrorClosingStory.module.css";

/**
 * The closing story — an unnumbered reflective section before the final
 * CTA, distinct from it: this states why Smart Mirror exists one last
 * time and shows the reflective closing visual; the CTA immediately after
 * is the actual invitation to start a project, with its own separate
 * title. This is one of the page's two dark sections (with Chapter 12 —
 * Privacy), within the brief's two-dark-section budget.
 *
 * W2.3A — rebuilt from a stacked (visual above, text below) layout into a
 * single-row editorial split (visual and copy side by side, reversed at
 * mobile so the copy still reads first), roughly halving the section's
 * vertical footprint compared to the original stacked version.
 */
export function SmartMirrorClosingStory() {
  return (
    <Section id="closing-story" tone="dark" spacing="default">
      <Container width="wide">
        <div className={styles.split}>
          <div className={styles.copy}>
            <h2 className={`text-h2 ${styles.heading}`}>{SMART_MIRROR_STORY_CLOSING.title}</h2>
            <p className={`text-body-lg ${styles.supporting}`}>{SMART_MIRROR_STORY_CLOSING.supporting}</p>
            <p className={styles.principle}>{CLOSING_PRINCIPLE}</p>
          </div>
          <div className={styles.visual}>
            <SmartMirrorClosingVisual />
          </div>
        </div>
      </Container>
    </Section>
  );
}
