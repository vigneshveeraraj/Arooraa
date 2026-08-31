import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { IDEA_TO_PRODUCTION } from "@/lib/content/about";
import { IdeaToProductionVisual } from "./IdeaToProductionVisual";
import styles from "./IdeaToProductionSection.module.css";

/** Chapter 04 — From idea to production (W3.1 §10). */
export function IdeaToProductionSection() {
  return (
    <Section id="idea-to-production" spacing="default">
      <Container width="wide">
        <SectionHeading title={IDEA_TO_PRODUCTION.heading} />
        <IdeaToProductionVisual />
        <div className={styles.entry}>
          <p className="text-body-lg">{IDEA_TO_PRODUCTION.entryIntro}</p>
          <ul className={styles.list}>
            {IDEA_TO_PRODUCTION.entryPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button href={IDEA_TO_PRODUCTION.cta.href} variant="secondary">
            {IDEA_TO_PRODUCTION.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
