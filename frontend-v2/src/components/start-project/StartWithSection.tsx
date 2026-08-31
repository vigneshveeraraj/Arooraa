import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { START_WITH_CLOSING, START_WITH_HEADING, START_WITH_ITEMS } from "@/lib/content/start-project";
import styles from "./StartWithSection.module.css";

/** Marketing proof around the form (W3.2A §30). */
export function StartWithSection() {
  return (
    <Section id="start-with" spacing="default">
      <Container width="wide">
        <SectionHeading title={START_WITH_HEADING} />
        <ul className={styles.grid}>
          {START_WITH_ITEMS.map((item) => (
            <li key={item.title} className={styles.item}>
              <h3 className="text-h4">{item.title}</h3>
              <p className={`text-body-sm ${styles.description}`}>{item.description}</p>
            </li>
          ))}
        </ul>
        <p className={`text-body-lg ${styles.closing}`}>{START_WITH_CLOSING}</p>
      </Container>
    </Section>
  );
}
