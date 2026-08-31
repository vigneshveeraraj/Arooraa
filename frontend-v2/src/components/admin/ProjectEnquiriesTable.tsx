import Link from "next/link";
import type { AdminLeadSummary } from "@/lib/admin/types";
import { StatusPill } from "./StatusPill";
import styles from "./shared/AdminTable.module.css";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Shortens a long email's local-part so the secondary line never forces
 * the row wider than the customer name above it — the full address is
 * always available on the detail page. */
function truncateEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 8) return email;
  return `${email.slice(0, 8)}…${email.slice(at)}`;
}

/**
 * W3.2D.1 Phase 7 — a denser desktop hierarchy than the raw column list:
 * customer name carries email + masked phone as a secondary line rather
 * than two more full-width columns, matching the brief's own example
 * ("Vignesh Veeraraj / vignesh...@gmail.com · +91••••••••47"). Company
 * folds into the same line when present, since it's rarely set today.
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
            <th>Direction</th>
            <th>Preferred Contact</th>
            <th>Status</th>
            <th>Received</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id}>
              <td data-label="Reference" className={styles.nowrap}>
                {enquiry.referenceNumber}
              </td>
              <td data-label="Customer">
                <span className={styles.primary}>
                  {enquiry.customerName}
                  {enquiry.companyOrRestaurant ? ` — ${enquiry.companyOrRestaurant}` : ""}
                </span>
                {(enquiry.email || enquiry.maskedPhone) && (
                  <span className={styles.secondary}>
                    {[enquiry.email ? truncateEmail(enquiry.email) : null, enquiry.maskedPhone]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </td>
              <td data-label="Direction">{enquiry.direction ?? "—"}</td>
              <td data-label="Preferred Contact">{enquiry.preferredContactMethod ?? "—"}</td>
              <td data-label="Status">
                <StatusPill status={enquiry.status} />
              </td>
              <td data-label="Received" className={styles.nowrap}>
                {formatDateTime(enquiry.createdAt)}
              </td>
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
