import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CROSS_CUTTING_CAPABILITIES, CROSS_CUTTING_HEADING } from "@/lib/content/services";
import styles from "./CrossCuttingCapabilities.module.css";

/**
 * UX/UI, Quality Engineering and Security by Design (S1) — explicitly not
 * top-level service groups (SERVICE_GROUPS stays at exactly six), shown
 * here as capabilities applied across whichever engagement a client starts
 * from. No routes for these in S1.
 */
export function CrossCuttingCapabilities() {
  return (
    <Section id="cross-cutting-capabilities" spacing="compact">
      <Container>
        <SectionHeading eyebrow={CROSS_CUTTING_HEADING.eyebrow} title={CROSS_CUTTING_HEADING.title} />

        <div className={styles.grid}>
          {CROSS_CUTTING_CAPABILITIES.map((capability) => (
            <div key={capability.name} className={styles.item}>
              <p className="text-h4">{capability.name}</p>
              <p className={`text-body-sm ${styles.description}`}>{capability.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
