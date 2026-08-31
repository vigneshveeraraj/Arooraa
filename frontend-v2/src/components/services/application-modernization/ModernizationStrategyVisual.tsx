import styles from "./ModernizationStrategyVisual.module.css";

const PHASES = ["Understand", "Stabilize", "Isolate", "Modernize", "Validate", "Evolve"];

/**
 * The Approach section's companion visual (S5) — a plain phased-strip, same
 * visual language as the pill-row sequence components used on the other
 * service pages (DiscoverySequenceVisual, AiApproachSequenceVisual). The
 * six phases are already covered as real text in the Approach section's own
 * body copy, so this stays decorative.
 */
export function ModernizationStrategyVisual() {
  return (
    <ol className={styles.phases} aria-hidden="true">
      {PHASES.map((phase) => (
        <li key={phase} className={styles.phase}>
          {phase}
        </li>
      ))}
    </ol>
  );
}
