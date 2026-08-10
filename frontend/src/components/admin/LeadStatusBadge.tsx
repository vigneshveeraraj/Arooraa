import styles from "./LeadStatusBadge.module.css";

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

export function LeadStatusBadge({ status }: { status: string }) {
  return <span className={`${styles.badge} ${STATUS_CLASS[status] ?? ""}`}>{humanizeStatus(status)}</span>;
}
