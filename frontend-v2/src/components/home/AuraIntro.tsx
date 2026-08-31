import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AURA_CTA_LABEL,
  AURA_EXAMPLE_PROMPTS,
  AURA_HEADING,
  AURA_PREVIEW_NOTE,
  AURA_PROMPT_QUESTION,
} from "@/lib/content/aura";
import styles from "./AuraIntro.module.css";

export function AuraIntro() {
  return (
    <Section spacing="compact" className={styles.aura}>
      <Container>
        <div className={styles.layout}>
          <div className={styles.message}>
            <SectionHeading
              eyebrow={AURA_HEADING.eyebrow}
              title={AURA_HEADING.title}
              description={AURA_HEADING.description}
            />
          </div>

          <Card className={styles.auraPanel}>
            <div className={styles.panelHeader}>
              <p className={`text-h4 ${styles.auraName}`}>Aura</p>
              <Badge variant="neutral">Preview</Badge>
            </div>
            <p className={`text-body ${styles.promptQuestion}`}>{AURA_PROMPT_QUESTION}</p>

            <ul className={styles.promptList}>
              {AURA_EXAMPLE_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <Badge variant="neutral">{prompt}</Badge>
                </li>
              ))}
            </ul>

            <div className={styles.ctaRow}>
              <Button variant="primary" disabled>
                {AURA_CTA_LABEL}
              </Button>
              <span className={`text-label ${styles.comingSoon}`}>{AURA_PREVIEW_NOTE}</span>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
