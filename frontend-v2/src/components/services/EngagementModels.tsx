import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ENGAGEMENT_MODELS, ENGAGEMENT_MODELS_HEADING } from "@/lib/content/services";
import styles from "./EngagementModels.module.css";

/**
 * Four public-safe engagement models (S1) — no fixed pricing, no
 * Bronze/Silver/Gold packaging, per the brief's explicit restraint.
 */
export function EngagementModels() {
  return (
    <Section id="engagement-models" spacing="compact" tone="dark">
      <Container>
        <SectionHeading eyebrow={ENGAGEMENT_MODELS_HEADING.eyebrow} title={ENGAGEMENT_MODELS_HEADING.title} />

        <div className={styles.grid}>
          {ENGAGEMENT_MODELS.map((model) => (
            <div key={model.name} className={styles.item}>
              <p className="text-h4">{model.name}</p>
              <p className={`text-body-sm ${styles.description}`}>{model.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
