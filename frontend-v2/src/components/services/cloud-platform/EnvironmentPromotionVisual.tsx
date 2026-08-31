import styles from "./EnvironmentPromotionVisual.module.css";

const ENVIRONMENTS = ["Development", "Validation", "Staging", "Production"];

/**
 * The Environments section's companion visual (S6) — "one product,
 * different controlled environments." Four identically-shaped stages
 * (same product identity) with only a small accent-dot varying between
 * them (environment-specific configuration), connected by single downward
 * arrows only — one direction, no shortcuts, standing in for "controlled
 * promotion" and "no manual copying." The same four environment names are
 * already stated as real text in this section's own body copy, so this
 * stays decorative.
 */
export function EnvironmentPromotionVisual() {
  return (
    <ol className={styles.stages} aria-hidden="true">
      {ENVIRONMENTS.map((env, index) => (
        <li key={env} className={styles.stage}>
          <span className={styles.dot} style={{ opacity: 0.35 + index * 0.2 }} />
          <span className={styles.label}>{env}</span>
        </li>
      ))}
    </ol>
  );
}
