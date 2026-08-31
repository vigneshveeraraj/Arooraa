import styles from "./MesaCapabilityMap.module.css";

const CAPABILITIES = [
  {
    name: "Digital Dining",
    position: styles.nodeTop,
    icon: (
      <>
        <rect x="4" y="3" width="12" height="16" rx="2" />
        <path d="M8 16h4" />
      </>
    ),
  },
  {
    name: "Kitchen Coordination",
    position: styles.nodeUpperRight,
    icon: (
      <>
        <rect x="4" y="3" width="12" height="15" rx="1" />
        <path d="M6 7h8" />
        <path d="M6 10h8" />
        <path d="M6 13h8" />
      </>
    ),
  },
  {
    name: "Staff Operations",
    position: styles.nodeLowerRight,
    icon: (
      <>
        <rect x="5" y="4" width="10" height="13" rx="2" />
        <circle cx="10" cy="9" r="2" />
        <path d="M7 14h6" />
      </>
    ),
  },
  {
    name: "Billing & Commerce",
    position: styles.nodeLowerLeft,
    icon: (
      <>
        <rect x="3" y="6" width="14" height="9" rx="1.5" />
        <path d="M3 9.5h14" />
        <rect x="5" y="12" width="4" height="1.5" />
      </>
    ),
  },
  {
    name: "Restaurant Management",
    position: styles.nodeUpperLeft,
    icon: (
      <>
        <rect x="3" y="3" width="6" height="6" />
        <rect x="11" y="3" width="6" height="6" />
        <rect x="3" y="11" width="6" height="6" />
        <rect x="11" y="11" width="6" height="6" />
      </>
    ),
  },
];

/**
 * The flagship visual for the MESA page (P2.2, replaces the P2.1
 * MesaCapabilityHub). Deliberately a different visual concept from the
 * hero's radial network diagram — a restaurant "surface" with the five
 * approved capability areas as elevated cards, so the page doesn't feel
 * like the same abstract hub repeated. The connecting lines are decorative
 * SVG (aria-hidden); every capability name is real, visible text, since
 * they're rendered as ordinary HTML cards rather than baked-in SVG text.
 * Below the desktop breakpoint the cards fall back to a simple stacked
 * list rather than an absolute layout that would crowd a narrow screen.
 */
export function MesaCapabilityMap() {
  return (
    <div className={styles.map}>
      <svg className={styles.linkLayer} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="50" y1="50" x2="50" y2="12" />
        <line x1="50" y1="50" x2="86" y2="38" />
        <line x1="50" y1="50" x2="72" y2="81" />
        <line x1="50" y1="50" x2="28" y2="81" />
        <line x1="50" y1="50" x2="14" y2="38" />
      </svg>

      <div className={`${styles.card} ${styles.core}`}>
        <p className={`text-h4 ${styles.coreLabel}`}>MESA</p>
      </div>

      {CAPABILITIES.map((capability) => (
        <div key={capability.name} className={`${styles.card} ${styles.node} ${capability.position}`}>
          <svg
            className={styles.nodeIcon}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {capability.icon}
          </svg>
          <span className={styles.nodeLabel}>{capability.name}</span>
        </div>
      ))}
    </div>
  );
}
