import styles from "./SmartMirrorIcons.module.css";

/**
 * W2.3 — a small shared set of calm line icons for Smart Mirror's own
 * vocabulary (mirror, clock, calendar, family, dumbbell, scissors, welcome,
 * sun, moon, door, chip, display, frame, lock, phone, eye). Its own
 * component family, independent of MESA's JourneyIcons and Mindra's
 * MindraIcons. Every icon is aria-hidden — callers are responsible for the
 * real, visible text label beside it.
 */
export function MirrorIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="5" />
      <line x1="9.5" y1="7" x2="9.5" y2="17" opacity="0.5" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 V12 L15.2 14" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function FamilyIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8.5" cy="8" r="2.6" />
      <circle cx="15.7" cy="9" r="2.1" />
      <path d="M3.5 19 a5 5 0 0 1 10 0" />
      <path d="M14 19 a4 4 0 0 1 7 -2.4" />
    </svg>
  );
}

export function DumbbellIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <line x1="4" y1="12" x2="20" y2="12" />
      <rect x="2" y="9" width="3.2" height="6" rx="1" />
      <rect x="18.8" y="9" width="3.2" height="6" rx="1" />
      <rect x="6.5" y="7.5" width="2.4" height="9" rx="1" />
      <rect x="15.1" y="7.5" width="2.4" height="9" rx="1" />
    </svg>
  );
}

export function ScissorsIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <line x1="8.5" y1="8" x2="20" y2="18" />
      <line x1="8.5" y1="16" x2="20" y2="6" />
    </svg>
  );
}

export function WelcomeIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19 h16" />
      <path d="M5.5 19 V11 a6.5 6.5 0 0 1 13 0 V19" />
      <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2.5" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="21.5" y2="12" />
      <line x1="5.3" y1="5.3" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="18.7" y2="18.7" />
      <line x1="5.3" y1="18.7" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="18.7" y2="5.3" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 14.5 A8 8 0 1 1 9.5 5 A6.3 6.3 0 0 0 19 14.5 Z" />
    </svg>
  );
}

export function DoorIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20 V5.5 L15 3.5 V20" />
      <line x1="4" y1="20" x2="17" y2="20" />
      <circle cx="12.2" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M17 20 h3" />
    </svg>
  );
}

export function ChipIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <circle cx="12" cy="12" r="2.4" />
      <line x1="12" y1="2.5" x2="12" y2="5.5" />
      <line x1="12" y1="18.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5.5" y2="12" />
      <line x1="18.5" y1="12" x2="21.5" y2="12" />
    </svg>
  );
}

export function DisplayIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.8" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16.5" x2="12" y2="20" />
    </svg>
  );
}

export function FrameIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <rect x="7.5" y="6.5" width="9" height="11" rx="1.5" opacity="0.5" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.5" y="11" width="13" height="9.5" rx="2.2" />
      <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.4" />
      <line x1="10.5" y1="19" x2="13.5" y2="19" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12 C5 7 9 5 12 5 C15 5 19 7 21.5 12 C19 17 15 19 12 19 C9 19 5 17 2.5 12 Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
