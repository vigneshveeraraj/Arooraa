import styles from "./StatusPill.module.css";

const STATUS_CLASS: Record<string, string | undefined> = {
  NEW: styles.statusNew,
  CONTACTED: styles.statusContacted,
  QUALIFIED: styles.statusQualified,
  PROPOSAL_SENT: styles.statusProposal,
  NEGOTIATION: styles.statusNegotiation,
  WON: styles.statusWon,
  LOST: styles.statusLost,
};

export function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Reuses the EXISTING EnquiryStatus/LeadStatus values exactly (W3.2D.1
 * Phase 9) — no REVIEWING/DISCOVERY/CLOSED. Color plus the label text
 * together, never color alone (Phase 14 accessibility).
 */
export function StatusPill({ status }: { status: string }) {
  return <span className={`${styles.pill} ${STATUS_CLASS[status] ?? ""}`}>{humanizeStatus(status)}</span>;
}
