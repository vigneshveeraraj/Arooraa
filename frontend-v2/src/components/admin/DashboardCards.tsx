import type { DashboardSummary } from "@/lib/admin/types";
import styles from "./DashboardCards.module.css";

/** Every count here is read straight from DashboardSummary — nothing computed or invented client-side. */
export function DashboardCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    { label: "New Leads", value: summary.totalNewLeads },
    { label: "Follow-up Today", value: summary.followUpsDueToday, highlight: summary.followUpsDueToday > 0 },
    { label: "Overdue", value: summary.overdueFollowUps, danger: summary.overdueFollowUps > 0 },
    { label: "Qualified", value: summary.qualified },
    { label: "Proposal Sent", value: summary.proposalSent },
    { label: "Won", value: summary.won },
  ];

  return (
    <ul className={styles.grid}>
      {cards.map((card) => (
        <li
          key={card.label}
          className={`${styles.card} ${card.danger ? styles.danger : ""} ${card.highlight ? styles.highlight : ""}`}
        >
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardSplit({ summary }: { summary: DashboardSummary }) {
  return (
    <div className={styles.splitGrid}>
      <div className={styles.splitCard}>
        <span className={styles.splitValue}>{summary.newProjectEnquiries}</span>
        <span className={styles.splitLabel}>New Project Enquiries</span>
      </div>
      <div className={styles.splitCard}>
        <span className={styles.splitValue}>{summary.newMesaDemoRequests}</span>
        <span className={styles.splitLabel}>New MESA Demo Requests</span>
      </div>
    </div>
  );
}
