import styles from "./SmartMirrorPrivacyVisual.module.css";

const STATES = [
  { label: "Camera", value: "Off unless in use" },
  { label: "Microphone", value: "Muted unless in use" },
  { label: "Mode", value: "Private" },
];

/**
 * A restrained mirror-state visual for Privacy by Design (P4) — a plain
 * "current state" strip, not a security architecture diagram. Real,
 * accessible text throughout, since these states carry meaning not stated
 * elsewhere on the page. No authorization internals, encryption details or
 * recognition mechanics are represented — just the visible states the
 * brief asks to make product strengths.
 */
export function SmartMirrorPrivacyVisual() {
  return (
    <div className={styles.panel}>
      {STATES.map((state) => (
        <div key={state.label} className={styles.row}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>{state.label}</span>
          <span className={styles.value}>{state.value}</span>
        </div>
      ))}
    </div>
  );
}
