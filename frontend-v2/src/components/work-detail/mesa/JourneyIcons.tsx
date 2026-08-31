import styles from "./JourneyIcons.module.css";

/**
 * W2.1.2B — a small shared set of line icons for the MESA guest-journey
 * vocabulary (Scan QR, Browse Menu, Order, Call Waiter, Play While Waiting,
 * Kitchen, Service, Bill, Arrive). Reused across the hero journey strip,
 * the Chapter 3 table-experience layer, the Chapter 4 role cues and the
 * Chapter 6 timeline so the same concept always reads as the same mark.
 * Every icon is aria-hidden — the caller is always responsible for placing
 * the real, visible text label next to it.
 */
export function ArriveIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21 C12 21 5 14 5 9 a7 7 0 0 1 14 0 C19 14 12 21 12 21 Z" />
      <circle cx="12" cy="9" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function QrIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14.5" y="14.5" width="2.6" height="2.6" fill="currentColor" stroke="none" />
      <rect x="18.4" y="14.5" width="2.6" height="2.6" fill="currentColor" stroke="none" />
      <rect x="14.5" y="18.4" width="2.6" height="2.6" fill="currentColor" stroke="none" />
      <rect x="18.4" y="18.4" width="2.6" height="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.5 C9.3 4 5.4 4 3.2 5 V19 C5.4 18 9.3 18 12 19.5 C14.7 18 18.6 18 20.8 19 V5 C18.6 4 14.7 4 12 5.5 Z" />
      <line x1="12" y1="5.5" x2="12" y2="19.5" />
    </svg>
  );
}

export function OrderIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}

export function CallWaiterIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18 a8 8 0 0 1 16 0 z" fill="currentColor" stroke="none" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" />
      <path className={styles.fillPath} d="M10 8.3 L16.2 12 L10 15.7 Z" />
    </svg>
  );
}

export function ServiceIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 13 a8 8 0 0 1 16 0" fill="none" />
      <ellipse cx="12" cy="13" rx="8" ry="2.4" fill="none" />
      <circle cx="12" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function KitchenIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="9" width="16" height="5" rx="1.5" fill="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <line x1="8" y1="5" x2="8" y2="9" />
      <line x1="16" y1="5" x2="16" y2="9" />
    </svg>
  );
}

export function BillIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="1.5" fill="none" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
