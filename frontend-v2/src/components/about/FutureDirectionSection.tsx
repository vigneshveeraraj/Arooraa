import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FUTURE_DIRECTION } from "@/lib/content/about";
import { FutureHorizonVisual } from "./FutureHorizonVisual";
import styles from "./FutureDirectionSection.module.css";

/** Chapter 11 — What AROORAA wants to become (W3.1 §18–19). */
export function FutureDirectionSection() {
  return (
    <Section id="future-direction" spacing="default">
      <Container width="wide">
        <SectionHeading title={FUTURE_DIRECTION.heading} />
        <ul className={styles.directions}>
          {FUTURE_DIRECTION.directions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <FutureHorizonVisual />
        <p className={`text-h3 ${styles.strongMessage}`}>{FUTURE_DIRECTION.strongMessage}</p>
      </Container>
    </Section>
  );
}
