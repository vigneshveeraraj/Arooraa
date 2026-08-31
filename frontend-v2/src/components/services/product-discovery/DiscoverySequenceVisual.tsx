import styles from "./DiscoverySequenceVisual.module.css";

const STEPS = ["Understand", "Discover", "Define", "Validate", "Plan"];

/**
 * The Approach section's companion visual (S2.1) — a compact step row
 * under the paragraph, reusing the same restrained pill style already
 * established for the Services Index's How We Work section. The sequence
 * is already narrated in the section's own body text, so this stays
 * decorative.
 */
export function DiscoverySequenceVisual() {
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
