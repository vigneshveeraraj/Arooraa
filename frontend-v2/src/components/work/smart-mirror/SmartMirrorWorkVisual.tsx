import styles from "./SmartMirrorWorkVisual.module.css";

const PRIMARY_CALLOUTS = [
  { label: "Morning", x: 50, y: 8 },
  { label: "Family", x: 80, y: 50 },
  { label: "Home", x: 75, y: 72 },
];

const SECONDARY_CALLOUTS = [
  { label: "Day context", x: 78, y: 25 },
  { label: "Information", x: 50, y: 90 },
];

const ENGINEERING_FRAGMENTS = ["Reflective Surface", "Display", "Edge Computing"];

/**
 * Smart Mirror's cinematic visual story (W1) — a large ambient mirror
 * environment, not a UI screenshot: a soft glowing panel and a rounded
 * mirror silhouette with a reflective highlight, surrounded by small
 * contextual callouts naming the kinds of information that appear on it.
 * The mirror shape itself is purely atmospheric (aria-hidden), but the
 * callouts and the engineering-fragment tag row below are real, visible
 * text — they carry information not otherwise stated in this story's own
 * copy, so they stay in the accessible page, not hidden inside the
 * decorative graphic. Two secondary callouts hide below 640px to keep the
 * composition legible on small screens without losing the core idea.
 */
export function SmartMirrorWorkVisual() {
  return (
    <div className={styles.panel}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.frame}>
        <svg className={styles.svg} viewBox="0 0 480 420" aria-hidden="true">
          <rect className={styles.mirror} x="140" y="40" width="200" height="320" rx="100" />
          <path className={styles.highlight} d="M180,90 Q220,60 260,80" />
        </svg>
        {PRIMARY_CALLOUTS.map((callout) => (
          <span key={callout.label} className={styles.callout} style={{ left: `${callout.x}%`, top: `${callout.y}%` }}>
            {callout.label}
          </span>
        ))}
        {SECONDARY_CALLOUTS.map((callout) => (
          <span
            key={callout.label}
            className={`${styles.callout} ${styles.calloutSecondary}`}
            style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
          >
            {callout.label}
          </span>
        ))}
      </div>
      <ul className={styles.fragments}>
        {ENGINEERING_FRAGMENTS.map((fragment) => (
          <li key={fragment} className={styles.fragment}>
            {fragment}
          </li>
        ))}
      </ul>
    </div>
  );
}
