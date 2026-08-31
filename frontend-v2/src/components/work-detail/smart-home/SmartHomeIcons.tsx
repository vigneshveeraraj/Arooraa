import styles from "./SmartHomeIcons.module.css";

/**
 * W2.4 — a small shared set of calm line icons for Arooraa Smart Home's own
 * vocabulary (lightbulb, AC, energy, water, wrench, safety, routine, room,
 * switch, gateway/chip, house, cloud, bike, car, grooming, nail care,
 * observation, check). Its own component family, independent of MESA's
 * JourneyIcons, Mindra's MindraIcons and Smart Mirror's SmartMirrorIcons.
 * Every icon is aria-hidden — callers are responsible for the real,
 * visible text label beside it.
 */
export function LightbulbIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18 h6 M9.5 21 h5" />
      <path d="M12 3 a6 6 0 0 0 -3.5 10.9 c0.7 0.6 1.1 1.3 1.1 2.1 h4.8 c0 -0.8 0.4 -1.5 1.1 -2.1 A6 6 0 0 0 12 3 Z" />
    </svg>
  );
}

export function ACIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="8" rx="2" />
      <path d="M6 17 v2 M10 17 v2.6 M14 17 v2 M18 17 v2.6" />
    </svg>
  );
}

export function EnergyIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.5 2.5 L5.5 13.5 H11 L10.5 21.5 L18.5 10 H13 Z" />
    </svg>
  );
}

export function WaterDropIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 C12 2.5 5.5 10.5 5.5 15 a6.5 6.5 0 0 0 13 0 C18.5 10.5 12 2.5 12 2.5 Z" />
    </svg>
  );
}

export function WrenchIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 6.3 a4 4 0 0 0 -5.4 5.4 L3.5 17.5 l3 3 l5.8 -5.8 a4 4 0 0 0 5.4 -5.4 l-2.7 2.7 l-2 -2 z" />
    </svg>
  );
}

export function SafetyIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 L19.5 6 V11.5 C19.5 16.2 16.4 19.9 12 21.5 C7.6 19.9 4.5 16.2 4.5 11.5 V6 Z" />
      <path d="M9 12 L11 14 L15.2 9.5" />
    </svg>
  );
}

export function RoutineIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 V12 L15.2 14" />
    </svg>
  );
}

export function RoomIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 21 V8.5 L12 3 L20.5 8.5 V21" />
      <path d="M8.5 21 V13 h7 v8" />
    </svg>
  );
}

export function SwitchIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <circle cx="12" cy="8.2" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GatewayIcon() {
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

export function HouseIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 11 L12 3.5 L20.5 11" />
      <path d="M5.5 9.5 V20.5 h13 V9.5" />
    </svg>
  );
}

export function CloudIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 18 a4 4 0 0 1 -0.5 -8 a5.5 5.5 0 0 1 10.6 -1.8 A4.2 4.2 0 0 1 17.5 18 Z" />
    </svg>
  );
}

export function BikeIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M5.5 17 L10 8 h4 M10 8 L14 17 h4.5 M12 8 L15 17" />
      <circle cx="10" cy="6" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CarIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 16.5 V12 l2 -4.5 h12 L20 12 v4.5" />
      <path d="M2.5 16.5 h19" />
      <circle cx="7" cy="16.5" r="1.6" />
      <circle cx="17" cy="16.5" r="1.6" />
    </svg>
  );
}

export function GroomingIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <line x1="8.5" y1="8" x2="20" y2="18" />
      <line x1="8.5" y1="16" x2="20" y2="6" />
    </svg>
  );
}

export function NailCareIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12 V6 a2.5 2.5 0 0 1 5 0 v6" />
      <path d="M8 12 h9 a2 2 0 0 1 0 4 H10 a5 5 0 0 1 -5 -5 V9" />
    </svg>
  );
}

export function ObservationIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12 C5 7 9 5 12 5 C15 5 19 7 21.5 12 C19 17 15 19 12 19 C9 19 5 17 2.5 12 Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5 L10.8 15.3 L16.2 9" />
    </svg>
  );
}
