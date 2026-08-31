import styles from "./PlatformApproachVisual.module.css";

const STEPS = ["Understand", "Define", "Establish", "Observe", "Harden", "Validate", "Evolve"];

/**
 * The Approach section's companion visual (S6) — a plain step-row, same
 * visual language as the pill-row sequence components on the other service
 * pages (DiscoverySequenceVisual, AiApproachSequenceVisual,
 * ModernizationStrategyVisual). The seven steps are already stated as real
 * text in the Approach section's own body copy, so this stays decorative.
 */
export function PlatformApproachVisual() {
  return (
    <ol className={styles.steps} aria-hidden="true">
      {STEPS.map((step) => (
        <li key={step} className={styles.step}>
          {step}
        </li>
      ))}
    </ol>
  );
}
