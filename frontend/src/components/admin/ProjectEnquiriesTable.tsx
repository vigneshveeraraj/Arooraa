import Link from "next/link";
import type { AdminLeadSummary } from "@/lib/admin/types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import styles from "./LeadsTable.module.css";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * W3.2D — the project-enquiry-specific view of the same admin lead data
 * LeadsTable renders generically (see AdminLeadQueryService.list on the
 * backend). Reuses LeadsTable.module.css rather than a parallel stylesheet —
 * same table shell, same responsive stacked-row behavior on mobile.
 */
export function ProjectEnquiriesTable({ enquiries }: { enquiries: AdminLeadSummary[] }) {
  if (enquiries.length === 0) {
    return <p className={styles.empty}>No project enquiries match these filters.</p>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Direction</th>
            <th>Preferred Contact</th>
            <th>Status</th>
            <th>Submitted</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id}>
              <td data-label="Reference">{enquiry.referenceNumber}</td>
              <td data-label="Customer">{enquiry.customerName}</td>
              <td data-label="Company">{enquiry.companyOrRestaurant ?? "—"}</td>
              <td data-label="Email">{enquiry.email ?? "—"}</td>
              <td data-label="Phone">{enquiry.maskedPhone ?? "—"}</td>
              <td data-label="Direction">{enquiry.direction ?? "—"}</td>
              <td data-label="Preferred Contact">{enquiry.preferredContactMethod ?? "—"}</td>
              <td data-label="Status">
                <LeadStatusBadge status={enquiry.status} />
              </td>
              <td data-label="Submitted">{formatDateTime(enquiry.createdAt)}</td>
              <td data-label="Actions">
                <Link href={`/admin/leads/detail?type=PROJECT_ENQUIRY&id=${enquiry.id}`} className={styles.openLink}>
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
