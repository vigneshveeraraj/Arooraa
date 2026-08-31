import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { ContactInfoPanel } from "./ContactInfoPanel";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

/**
 * The two-column body (W3.4 §5): editorial explanation on one side, the form on the other on
 * desktop; a single stacked column, form-first, on mobile so it stays fast to complete.
 */
export function ContactSection() {
  return (
    <Section spacing="compact">
      <Container>
        <div className={styles.grid}>
          <div className={styles.form}>
            <ContactForm />
          </div>
          <div className={styles.info}>
            <ContactInfoPanel />
          </div>
        </div>
      </Container>
    </Section>
  );
}
