import styles from "./MesaJourneyStrip.module.css";

const JOURNEY_STEPS = [
  {
    label: "Guest",
    icon: (
      <>
        <circle cx="7" cy="6" r="2" />
        <circle cx="13" cy="6" r="2" />
        <path d="M4 14h12" />
      </>
    ),
  },
  {
    label: "Restaurant Team",
    icon: (
      <>
        <rect x="5" y="4" width="10" height="13" rx="2" />
        <circle cx="10" cy="9" r="2" />
        <path d="M7 14h6" />
      </>
    ),
  },
  {
    label: "Kitchen",
    icon: (
      <>
        <rect x="5" y="10" width="10" height="6" rx="1" />
        <path d="M7 10V8" />
        <path d="M10 10V7" />
        <path d="M13 10V8" />
      </>
    ),
  },
  {
    label: "Service",
    icon: (
      <>
        <rect x="3" y="11" width="14" height="3" rx="1.5" />
        <path d="M2 12.5h1" />
        <path d="M17 12.5h1" />
      </>
    ),
  },
  {
    label: "Business View",
    icon: (
      <>
        <rect x="4" y="12" width="3" height="4" />
        <rect x="9" y="9" width="3" height="7" />
        <rect x="14" y="6" width="3" height="10" />
      </>
    ),
  },
];

/**
 * A connected-steps picture story for the Experience section (P2.2 upgrade
 * of the P2.1 dot-only stepper) — same vertical journey, now with a small
 * icon mark per stage reusing the same restaurant-facing glyph vocabulary as
 * RestaurantConnectionStory (guest, kitchen, service) for visual-family
 * consistency across the page. This restates the Experience paragraph's own
 * meaning (guest → team → kitchen → service → business view), so the whole
 * dot-and-icon-and-line column stays decorative/aria-hidden — the step
 * labels themselves stay real, accessible text.
 */
export function MesaJourneyStrip() {
  return (
    <ol className={styles.journey} aria-label="MESA connected service journey">
      {JOURNEY_STEPS.map((step, index) => (
        <li key={step.label} className={styles.step}>
          <span className={styles.dotWrap} aria-hidden="true">
            <span className={styles.dot}>
              <svg
                viewBox="0 0 20 20"
                className={styles.dotIcon}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {step.icon}
              </svg>
            </span>
            {index < JOURNEY_STEPS.length - 1 ? <span className={styles.line} /> : null}
          </span>
          <span className={styles.stepLabel}>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
