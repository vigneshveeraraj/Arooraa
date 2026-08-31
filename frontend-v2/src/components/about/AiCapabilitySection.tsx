import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AI_CAPABILITY } from "@/lib/content/about";
import styles from "./AiCapabilitySection.module.css";

/**
 * Chapter 07 — AI is a capability, not the identity (W3.1 §13). Deliberately
 * restrained: a chip row and two short lists, no AI-brain graphic and no
 * dedicated large visual — About should not read as an AI page.
 */
export function AiCapabilitySection() {
  return (
    <Section id="ai-capability" spacing="default">
      <Container width="content">
        <SectionHeading title={AI_CAPABILITY.heading} />
        <ul className={styles.roles}>
          {AI_CAPABILITY.roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
        <p className={`text-h3 ${styles.timeLine}`}>{AI_CAPABILITY.timeComplexityLine}</p>
        <p className="text-body-lg">{AI_CAPABILITY.limitsIntro}</p>
        <ul className={styles.limits}>
          {AI_CAPABILITY.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
