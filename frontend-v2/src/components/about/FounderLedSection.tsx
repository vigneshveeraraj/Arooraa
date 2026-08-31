import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FOUNDER_LED } from "@/lib/content/about";
import { FounderThinkingWallVisual } from "./FounderThinkingWallVisual";
import styles from "./FounderLedSection.module.css";

/** Chapter 10 — Founder-led, product-led (W3.1 §16–17). */
export function FounderLedSection() {
  return (
    <Section id="founder" spacing="default">
      <Container width="wide">
        <SectionHeading title={FOUNDER_LED.heading} />
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className="text-body-lg">{FOUNDER_LED.origin}</p>
            <p className={`text-h4 ${styles.recurring}`}>{FOUNDER_LED.recurringThought}</p>
            <ul className={styles.questions}>
              {FOUNDER_LED.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <p className="text-body-lg">{FOUNDER_LED.belief}</p>

            <p className={`text-label ${styles.contextIntro}`}>{FOUNDER_LED.contextIntro}</p>
            <ul className={styles.context}>
              {FOUNDER_LED.context.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <FounderThinkingWallVisual />
      </Container>
    </Section>
  );
}
