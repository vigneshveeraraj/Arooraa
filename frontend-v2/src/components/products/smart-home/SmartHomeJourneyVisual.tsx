import styles from "./SmartHomeJourneyVisual.module.css";

const STEPS = [
  { title: "Understand the home", detail: "Electrical and network survey and constraints." },
  { title: "Prove local reliability", detail: "Gateway, selected controls and manual coexistence." },
  { title: "Make energy visible", detail: "Whole-home and selected-circuit insight with useful alerts." },
  { title: "Expand carefully", detail: "Water, safety and additional rooms — after evidence." },
];

/**
 * The prototype-journey visual (P5) — a real, accessible ordered list for
 * Where We're Going, matching the source reference's own public-safe
 * four-step progression without exposing internal phase numbers.
 */
export function SmartHomeJourneyVisual() {
  return (
    <ol className={styles.steps} aria-label="Prototype journey: understand, prove, make visible, expand">
      {STEPS.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.index}>{index + 1}</span>
          <div>
            <p className={styles.title}>{step.title}</p>
            <p className={styles.detail}>{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
