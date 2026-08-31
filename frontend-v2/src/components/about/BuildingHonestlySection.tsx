import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUILDING_HONESTLY } from "@/lib/content/about";
import styles from "./BuildingHonestlySection.module.css";

/** Chapter 09 — Building honestly (W3.1 §15), one of the page's two dark sections. */
export function BuildingHonestlySection() {
  return (
    <Section id="honest-building" tone="dark" spacing="default">
      <Container width="content">
        <SectionHeading title={BUILDING_HONESTLY.heading} />
        <p className={`text-body-lg ${styles.intro}`}>{BUILDING_HONESTLY.intro}</p>
        <ul className={styles.steps}>
          {BUILDING_HONESTLY.deliberateSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>

        <div className={styles.columns}>
          <div>
            <p className={`text-label ${styles.columnLabel}`}>{BUILDING_HONESTLY.preferLabel}</p>
            <ul className={styles.preferList}>
              {BUILDING_HONESTLY.prefer.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={`text-label ${styles.columnLabel}`}>{BUILDING_HONESTLY.doNotNeedLabel}</p>
            <ul className={styles.skipList}>
              {BUILDING_HONESTLY.doNotNeed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className={`text-h3 ${styles.strongIdea}`}>{BUILDING_HONESTLY.strongIdea}</p>
      </Container>
    </Section>
  );
}
