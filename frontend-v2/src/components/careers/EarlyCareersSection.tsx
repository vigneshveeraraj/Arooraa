import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EARLY_CAREERS_CONTENT } from "@/lib/content/careers";
import styles from "./EarlyCareersSection.module.css";

export function EarlyCareersSection() {
  return (
    <Section spacing="compact">
      <Container width="content">
        <div className={styles.wrap}>
          <p className="text-eyebrow">{EARLY_CAREERS_CONTENT.eyebrow}</p>
          <h2 className={`text-h2 ${styles.title}`}>{EARLY_CAREERS_CONTENT.title}</h2>
          <p className={`text-body-lg ${styles.body}`}>{EARLY_CAREERS_CONTENT.body}</p>
          <Button href={EARLY_CAREERS_CONTENT.cta.href} variant="secondary">
            {EARLY_CAREERS_CONTENT.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
