import styles from "./ModernizationDecisionsVisual.module.css";

const DECISIONS = ["Keep", "Stabilize", "Expose", "Refactor", "Extract", "Replace"];

/**
 * A small supporting visual for the modernization-principle section (S5) —
 * six possible modernization decisions, shown as an unordered set (no
 * arrows, no implied sequence — the brief is explicit that this is not a
 * rigid universal framework). The caption itself stays real, visible text
 * ("Label it as: Possible modernization decisions"); only the pill row is
 * decorative, since the same six ideas are already stated in the section's
 * own body copy.
 */
export function ModernizationDecisionsVisual() {
  return (
    <div className={styles.wrapper}>
      <p className={styles.caption}>Possible modernization decisions</p>
      <ul className={styles.pills} aria-hidden="true">
        {DECISIONS.map((decision) => (
          <li key={decision} className={styles.pill}>
            {decision}
          </li>
        ))}
      </ul>
    </div>
  );
}
