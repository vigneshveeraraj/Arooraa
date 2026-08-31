import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WHY_AROORAA } from "@/lib/content/about";
import { FrictionToDirectionVisual } from "./FrictionToDirectionVisual";
import styles from "./WhyAroorraSection.module.css";

/**
 * Chapter 01 — Why AROORAA exists (W3.1 §5–6). Carries the company-level
 * origin story (repeated frustration becoming responsibility); the
 * founder-personal version of a similar theme lives separately in Chapter
 * 10 so the two don't read as a literal repeat.
 */
export function WhyAroorraSection() {
  return (
    <Section id="why-exists" spacing="default">
      <Container width="wide">
        <SectionHeading eyebrow={WHY_AROORAA.eyebrow} title={WHY_AROORAA.heading} />
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className="text-body-lg">{WHY_AROORAA.intro}</p>
            <ul className={styles.list}>
              {WHY_AROORAA.frustrations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={`text-body-lg ${styles.existsLine}`}>{WHY_AROORAA.existsLine}</p>

            <p className={`text-h3 ${styles.principle}`}>{WHY_AROORAA.complexityPrinciple}</p>
            <p className="text-body">{WHY_AROORAA.timePrinciple}</p>

            <p className={`text-h3 ${styles.principle}`}>{WHY_AROORAA.strongMessage}</p>

            <div className={styles.origin}>
              <p className={`text-label ${styles.originLabel}`}>{WHY_AROORAA.originMoment.label}</p>
              <ul className={styles.questions}>
                {WHY_AROORAA.originMoment.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
              <p className="text-body-lg">{WHY_AROORAA.originMoment.turningPoint}</p>
            </div>

            <p className="text-body">{WHY_AROORAA.bridgeConnector}</p>
          </div>
        </div>
        <FrictionToDirectionVisual />
      </Container>
    </Section>
  );
}
