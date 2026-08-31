import styles from "./MindraIcons.module.css";

/**
 * W2.2 — a small shared set of calm line icons for Mindra's own vocabulary
 * (Notes, Tasks, Bookmarks, Contacts, Grocery, Meal, Family, Reminders,
 * Search, Sync, Identity, Today, and — for future-direction mentions only —
 * Voice). Deliberately simpler and rounder than MESA's JourneyIcons, to
 * match Mindra's calmer visual personality. Every icon is aria-hidden —
 * callers are responsible for the real, visible text label beside it.
 */
export function NoteIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="8.5" />
      <line x1="8.5" y1="12.5" x2="15.5" y2="12.5" />
      <line x1="8.5" y1="16.5" x2="12.5" y2="16.5" />
    </svg>
  );
}

export function TaskIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.5 L11 15 L16 9" />
    </svg>
  );
}

export function BookmarkIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5 h12 v17 l-6 -4.2 l-6 4.2 z" />
    </svg>
  );
}

export function ContactIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20 a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function GroceryIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8 h12 l-1.3 10.2 a2 2 0 0 1 -2 1.8 h-5.4 a2 2 0 0 1 -2 -1.8 z" />
      <path d="M9 8 V6.5 a3 3 0 0 1 6 0 V8" />
    </svg>
  );
}

export function MealIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
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

export function ReminderIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18 a7 7 0 0 1 14 0 z" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="12" cy="4.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" />
      <line x1="15.2" y1="15.2" x2="20" y2="20" />
    </svg>
  );
}

export function SyncIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9 a7 7 0 0 1 12.5 -3.5 M19 5 v4 h-4" />
      <path d="M19 15 a7 7 0 0 1 -12.5 3.5 M5 19 v-4 h4" />
    </svg>
  );
}

export function IdentityIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="9" r="4" />
      <path d="M12.3 11.7 L19 18.4 M16 15 l2.2 -2.2 M18 17 l2.2 -2.2" />
    </svg>
  );
}

export function TodayIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2.5" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="21.5" y2="12" />
    </svg>
  );
}

export function VoiceIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11 a6.5 6.5 0 0 0 13 0" />
      <line x1="12" y1="17.5" x2="12" y2="21" />
    </svg>
  );
}

export function PlanIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}
