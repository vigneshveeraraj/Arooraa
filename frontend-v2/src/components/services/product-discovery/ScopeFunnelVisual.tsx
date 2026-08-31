import styles from "./ScopeFunnelVisual.module.css";

const STAGES = [
  { label: "Everything we could build", width: 100 },
  { label: "What creates value", width: 78 },
  { label: "What is feasible", width: 56 },
  { label: "What belongs in MVP", width: 34 },
];

/**
 * The Outcomes section's companion visual (S2) — an original, restrained
 * scope-narrowing funnel illustrating how discovery arrives at an MVP
 * boundary. Deliberately not a proprietary scoring framework — just four
 * plain, illustrative stages. The same idea (MVP Scope, Prioritized
 * Capabilities) is already stated as real text in the Outcomes section
 * itself, so this stays decorative.
 */
export function ScopeFunnelVisual() {
  return (
    <div className={styles.funnel} aria-hidden="true">
      {STAGES.map((stage) => (
        <div key={stage.label} className={styles.row}>
          <div className={styles.bar} style={{ width: `${stage.width}%` }} />
          <span className={styles.label}>{stage.label}</span>
        </div>
      ))}
    </div>
  );
}
