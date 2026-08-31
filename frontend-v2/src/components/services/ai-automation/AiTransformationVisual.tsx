import styles from "./AiTransformationVisual.module.css";

const STEPS = [
  { label: "Manual Input" },
  { label: "Understand / Extract" },
  { label: "Business Rules" },
  { label: "AI Where Useful" },
  { label: "Human Review", emphasis: true },
  { label: "Action / Product Experience" },
];

/**
 * The Shift section's companion visual (S4) — a plain, six-step conceptual
 * flow ("from repetitive work to intelligent flow"). Deliberately generic
 * labels, not an architecture diagram: no model names, no infrastructure,
 * no internal pipeline detail. "Human Review" is the one visually
 * emphasized step, echoing the page's own "controlled automation" /
 * "keep people in control" language. The same idea is already stated as
 * real text in Business Problem, Outcomes ("Controlled Automation") and the
 * Human + Machine section, so this stays decorative.
 */
export function AiTransformationVisual() {
  return (
    <ol className={styles.flow} aria-hidden="true">
      {STEPS.map((step) => (
        <li key={step.label} className={`${styles.step} ${step.emphasis ? styles.emphasis : ""}`}>
          {step.label}
        </li>
      ))}
    </ol>
  );
}
