import styles from "./MesaMaturityProgression.module.css";

const STAGES = [
  { label: "Core Foundation", detail: "Connected restaurant journey" },
  { label: "Active Development", detail: "POS, Staff" },
  { label: "Long-Term Direction", detail: "Resilient operations, governed integrations" },
];

/**
 * A three-stage maturity visual for Where We're Going (P2.1 Diagram 4,
 * P2.2 lightly restyled into a restrained panel). Same dot-and-line stepper
 * technique as MesaJourneyStrip, for family consistency, with the dots
 * growing stage to stage as a subtle progression cue. Deliberately kept
 * simple per the brief — this restates the section's own paragraph (core
 * foundation → active development → long-term direction) rather than adding
 * new roadmap detail, so only the connecting dots/lines are decorative.
 */
export function MesaMaturityProgression() {
  return (
    <div className={styles.panel}>
      <ol className={styles.progression}>
        {STAGES.map((stage, index) => (
          <li key={stage.label} className={styles.stage}>
            <span className={styles.dotWrap} aria-hidden="true">
              <span className={`${styles.dot} ${styles[`dotStage${index + 1}`]}`} />
              {index < STAGES.length - 1 ? <span className={styles.line} /> : null}
            </span>
            <div className={styles.stageContent}>
              <p className={`text-h4 ${styles.stageLabel}`}>{stage.label}</p>
              <p className={`text-body-sm ${styles.stageDetail}`}>{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
