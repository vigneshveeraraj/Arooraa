import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WHAT_HAPPENS_NEXT, WHAT_HAPPENS_NEXT_HEADING } from "@/lib/content/start-project";
import styles from "./WhatHappensNext.module.css";

/** Early reassurance (W3.2A §4) — a simple 4-step list, not a sales funnel diagram. */
export function WhatHappensNext() {
  return (
    <Section id="what-happens-next" spacing="compact">
      <Container width="wide">
        <SectionHeading title={WHAT_HAPPENS_NEXT_HEADING} align="center" />
        <ol className={styles.list}>
          {WHAT_HAPPENS_NEXT.map((step) => (
            <li key={step.index} className={styles.item}>
              <span className={styles.index} aria-hidden="true">
                {step.index}
              </span>
              <h3 className="text-h4">{step.title}</h3>
              <p className={`text-body-sm ${styles.description}`}>{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
