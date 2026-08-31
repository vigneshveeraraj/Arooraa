import styles from "./AiApproachSequenceVisual.module.css";

const STEPS = ["Understand", "Identify", "Validate", "Prototype", "Engineer", "Launch & Improve"];

/**
 * The Approach section's companion visual (S4) — a plain step-row, same
 * visual language as Product Discovery's DiscoverySequenceVisual (not
 * shared code; each service page owns its own small sequence component).
 * The six steps are already stated as real text in the Approach section's
 * own body copy, so this stays decorative.
 */
export function AiApproachSequenceVisual() {
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
