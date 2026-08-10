import Link from "next/link";
import type { AdminLeadSummary } from "@/lib/admin/types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import styles from "./LeadsTable.module.css";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(followUpAt: string | null, status: string): boolean {
  if (!followUpAt || status === "WON" || status === "LOST") return false;
  return new Date(followUpAt).getTime() < Date.now();
}

export function LeadsTable({ leads }: { leads: AdminLeadSummary[] }) {
  if (leads.length === 0) {
    return <p className={styles.empty}>No leads match these filters.</p>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Customer</th>
            <th>Company / Restaurant</th>
            <th>Status</th>
            <th>Follow-up</th>
            <th>Created</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={`${lead.leadType}-${lead.id}`}>
              <td data-label="Reference">{lead.referenceNumber}</td>
              <td data-label="Type">{lead.leadType === "PROJECT_ENQUIRY" ? "Project" : "MESA Demo"}</td>
              <td data-label="Customer">{lead.customerName}</td>
              <td data-label="Company / Restaurant">{lead.companyOrRestaurant ?? "—"}</td>
              <td data-label="Status">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td data-label="Follow-up">
                {lead.followUpAt ? (
                  <span className={isOverdue(lead.followUpAt, lead.status) ? styles.overdue : undefined}>
                    {formatDate(lead.followUpAt)}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td data-label="Created">{formatDate(lead.createdAt)}</td>
              <td data-label="Actions">
                <Link
                  href={`/admin/leads/detail?type=${lead.leadType}&id=${lead.id}`}
                  className={styles.openLink}
                >
                  Open →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
