import styles from "./MindraDayStory.module.css";

const MOMENTS = [
  { label: "Morning", detail: "Check today's plan" },
  { label: "During the Day", detail: "Capture, add, assign" },
  { label: "Evening", detail: "Review and plan ahead" },
];

/**
 * Original Mindra-specific picture story for Experience (P3, Visual C) — a
 * calm three-moment rhythm rather than MESA's role-based journey strip.
 * Same dot-and-line stepper technique as the MESA visual family for a
 * consistent AROORAA foundation, restyled softer (pill markers, warmer
 * spacing) so Mindra doesn't read as MESA with different words. Restates
 * the Experience paragraph's own meaning, so only the connecting dots/line
 * are decorative — every moment's label and detail stay real, accessible
 * text.
 */
export function MindraDayStory() {
  return (
    <ol className={styles.day} aria-label="A day with Mindra">
      {MOMENTS.map((moment, index) => (
        <li key={moment.label} className={styles.moment}>
          <span className={styles.markerWrap} aria-hidden="true">
            <span className={styles.marker} />
            {index < MOMENTS.length - 1 ? <span className={styles.line} /> : null}
          </span>
          <div className={styles.momentContent}>
            <p className={`text-h4 ${styles.momentLabel}`}>{moment.label}</p>
            <p className={`text-body-sm ${styles.momentDetail}`}>{moment.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
