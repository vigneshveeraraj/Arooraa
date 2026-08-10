"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { StatusEditor } from "@/components/admin/lead-detail/StatusEditor";
import { ManagementEditor } from "@/components/admin/lead-detail/ManagementEditor";
import { NotesSection } from "@/components/admin/lead-detail/NotesSection";
import { ActivityTimeline } from "@/components/admin/lead-detail/ActivityTimeline";
import {
  fetchLeadDetail,
  updateAssignment,
  updateEstimatedValue,
  updateFollowUp,
  updateStatus,
  addNote,
} from "@/lib/admin/api";
import type { AdminLeadDetail, LeadType } from "@/lib/admin/types";
import panelStyles from "@/components/admin/lead-detail/panels.module.css";
import styles from "./page.module.css";

export default function AdminLeadDetailPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        {/* useSearchParams() must stay under a Suspense boundary — see
            https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout.
            It's also what makes the params update correctly across the client-side
            navigation from the leads list, unlike a one-time window.location read. */}
        <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
          <DetailContent />
        </Suspense>
      </AdminShell>
    </RequireAdmin>
  );
}

function DetailContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const type: LeadType | null = rawType === "PROJECT_ENQUIRY" || rawType === "MESA_DEMO" ? rawType : null;
  const id = searchParams.get("id");

  const [detail, setDetail] = useState<AdminLeadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);

  const load = useCallback(() => {
    if (!type || !id) {
      setError("Missing lead reference.");
      return;
    }
    fetchLeadDetail(type, id).then((result) => {
      if (result.ok) {
        setDetail(result.data);
        setError(null);
      } else {
        setError(result.error.message);
      }
    });
  }, [type, id]);

  useEffect(() => {
    // Fetching from the server on mount/param change is exactly the effect pattern
    // React's own docs endorse — this isn't derived state, it's syncing with an
    // external system (the backend).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function runMutation(action: () => Promise<{ ok: boolean; conflict?: boolean }>) {
    setSaving(true);
    setConflict(false);
    const result = await action();
    setSaving(false);
    if (result.ok) {
      load();
    } else if (result.conflict) {
      setConflict(true);
    }
    return result.ok;
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p role="alert">{error}</p>
        <Link href="/admin/leads" className="btn btnGhostOnDark">
          ← Back to leads
        </Link>
      </div>
    );
  }

  if (!detail) {
    return <p className={styles.loading}>Loading…</p>;
  }

  return (
    <div>
      <Link href="/admin/leads" className={styles.backLink}>
        ← Back to leads
      </Link>

      <div className={styles.header}>
        <div>
          <p className={styles.reference}>{detail.referenceNumber}</p>
          <h1 className={styles.heading}>{detail.customerName}</h1>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.typeTag}>{detail.leadType === "PROJECT_ENQUIRY" ? "Project Enquiry" : "MESA Demo"}</span>
          <LeadStatusBadge status={detail.status} />
        </div>
      </div>

      {conflict && (
        <div className={styles.conflict} role="alert">
          This lead was changed by someone else.{" "}
          <button type="button" onClick={load} className={styles.reloadButton}>
            Reload
          </button>{" "}
          to see the latest version before making further changes.
        </div>
      )}

      <div className={styles.grid}>
        <div>
          <section className={panelStyles.panel}>
            <h2 className={panelStyles.panelTitle}>Customer Information</h2>
            <dl className={styles.dl}>
              <div>
                <dt>Name</dt>
                <dd>{detail.customerName}</dd>
              </div>
              {detail.companyOrRestaurant && (
                <div>
                  <dt>{detail.leadType === "PROJECT_ENQUIRY" ? "Company" : "Restaurant"}</dt>
                  <dd>{detail.companyOrRestaurant}</dd>
                </div>
              )}
              {detail.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{detail.email}</dd>
                </div>
              )}
              {detail.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>{detail.phone}</dd>
                </div>
              )}
              {detail.cityOrCountry && (
                <div>
                  <dt>{detail.leadType === "PROJECT_ENQUIRY" ? "Country" : "City"}</dt>
                  <dd>{detail.cityOrCountry}</dd>
                </div>
              )}
              <div>
                <dt>Received</dt>
                <dd>{new Date(detail.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className={panelStyles.panel}>
            <h2 className={panelStyles.panelTitle}>
              {detail.leadType === "PROJECT_ENQUIRY" ? "Submitted Requirement" : "Demo Request Details"}
            </h2>
            <dl className={styles.dl}>
              {Object.entries(detail.submittedFields).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <NotesSection
            notes={detail.notes}
            saving={saving}
            onAddNote={(note) =>
              runMutation(async () => {
                const result = await addNote(detail.leadType, detail.id, note);
                return { ok: result.ok };
              })
            }
          />
        </div>

        <div>
          <StatusEditor
            currentStatus={detail.status}
            saving={saving}
            onSave={(status, lostReason) =>
              runMutation(async () => {
                const result = await updateStatus(detail.leadType, detail.id, status, lostReason, detail.leadVersion);
                return { ok: result.ok, conflict: !result.ok && result.error.kind === "CONFLICT" };
              })
            }
          />

          <ManagementEditor
            info={detail.managementInfo}
            saving={saving}
            onSaveAssignment={(assignedAdminId) =>
              runMutation(async () => {
                const result = await updateAssignment(
                  detail.leadType,
                  detail.id,
                  assignedAdminId,
                  detail.managementInfo.version,
                );
                return { ok: result.ok, conflict: !result.ok && result.error.kind === "CONFLICT" };
              })
            }
            onSaveFollowUp={(followUpAt) =>
              runMutation(async () => {
                const result = await updateFollowUp(
                  detail.leadType,
                  detail.id,
                  followUpAt,
                  detail.managementInfo.version,
                );
                return { ok: result.ok, conflict: !result.ok && result.error.kind === "CONFLICT" };
              })
            }
            onSaveEstimatedValue={(value, currency) =>
              runMutation(async () => {
                const result = await updateEstimatedValue(
                  detail.leadType,
                  detail.id,
                  value,
                  currency,
                  detail.managementInfo.version,
                );
                return { ok: result.ok, conflict: !result.ok && result.error.kind === "CONFLICT" };
              })
            }
          />

          <ActivityTimeline activity={detail.activity} />
        </div>
      </div>
    </div>
  );
}
