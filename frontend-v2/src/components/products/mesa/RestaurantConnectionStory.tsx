import type { ReactNode } from "react";
import styles from "./RestaurantConnectionStory.module.css";

const AREAS = [
  {
    name: "Guest & Table",
    icon: (
      <>
        <circle cx="7" cy="6" r="2" />
        <circle cx="13" cy="6" r="2" />
        <path d="M4 14h12" />
      </>
    ),
  },
  {
    name: "Service & Team",
    icon: (
      <>
        <rect x="3" y="11" width="14" height="3" rx="1.5" />
        <path d="M2 12.5h1" />
        <path d="M17 12.5h1" />
      </>
    ),
  },
  {
    name: "Kitchen",
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
    name: "Business View",
    icon: (
      <>
        <rect x="4" y="12" width="3" height="4" />
        <rect x="9" y="9" width="3" height="7" />
        <rect x="14" y="6" width="3" height="10" />
      </>
    ),
  },
];

function AreaIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * Original MESA-specific picture story for "The Problem" (P2.2, replaces the
 * P2.1 FragmentedVsConnectedDiagram). Same four restaurant-facing areas
 * appear on both sides — scattered and disconnected above, tidied into one
 * connected line beneath a MESA mark below — so the contrast itself tells
 * the story rather than abstract labels floating in space. No technical
 * internals: these are restaurant-facing concepts (guest, service, kitchen,
 * business view), not system components. Icons are decorative and
 * aria-hidden; area names are real, accessible text throughout.
 */
export function RestaurantConnectionStory() {
  return (
    <div className={styles.story}>
      <div className={styles.group}>
        <p className={`text-eyebrow ${styles.groupLabel}`}>Before MESA</p>
        <div className={styles.scatter} data-testid="before-panel">
          {AREAS.map((area, index) => (
            <div key={area.name} className={`${styles.scatterCard} ${index % 2 === 0 ? styles.tiltLeft : styles.tiltRight}`}>
              <span className={styles.icon}>
                <AreaIcon>{area.icon}</AreaIcon>
              </span>
              <span className={styles.cardLabel}>{area.name}</span>
            </div>
          ))}
        </div>
      </div>

      <span className={styles.arrow} aria-hidden="true">
        ↓
      </span>

      <div className={styles.group}>
        <p className={`text-eyebrow ${styles.groupLabel}`}>With MESA</p>
        <div className={styles.connected} data-testid="after-panel">
          <svg className={styles.thread} viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M20 24 Q 107 6, 160 20 T 300 16" />
          </svg>
          <div className={styles.connectedRow}>
            {AREAS.map((area) => (
              <div key={area.name} className={styles.connectedCard}>
                <span className={styles.icon}>
                  <AreaIcon>{area.icon}</AreaIcon>
                </span>
                <span className={styles.cardLabel}>{area.name}</span>
              </div>
            ))}
          </div>
          <p className={`text-label ${styles.mesaMark}`}>One connected system</p>
        </div>
      </div>
    </div>
  );
}
