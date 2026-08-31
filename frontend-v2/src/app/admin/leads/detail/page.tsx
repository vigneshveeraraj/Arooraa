"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { StatusEditor } from "@/components/admin/lead-detail/StatusEditor";
import { ManagementEditor } from "@/components/admin/lead-detail/ManagementEditor";
import { NotesSection } from "@/components/admin/lead-detail/NotesSection";
import { ActivityTimeline } from "@/components/admin/lead-detail/ActivityTimeline";
import { DetailSectionCard } from "@/components/admin/lead-detail/DetailSectionCard";
import { groupProjectEnquiryFields } from "@/lib/admin/project-enquiry-sections";
import {
  fetchLeadDetail,
  updateAssignment,
  updateEstimatedValue,
  updateFollowUp,
  updateStatus,
  addNote,
} from "@/lib/admin/api";
import type { AdminLeadDetail, LeadType } from "@/lib/admin/types";
import styles from "./page.module.css";

/**
 * Reuses the existing query-param route shape (?type=&id=), not a
 * `[id]` dynamic segment — this app builds as a static export, which has
 * no server to resolve an arbitrary id at request time (W3.2D.1 Phase 8).
 */
export default function AdminLeadDetailPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
          <DetailContent />
        </Suspense>
      </AdminShell>
    </RequireAdmin>
  );
}

function customerSectionRows(detail: AdminLeadDetail) {
  const rows: { label: string; value: string }[] = [{ label: "Name", value: detail.customerName }];
  if (detail.companyOrRestaurant) {
    rows.push({ label: detail.leadType === "PROJECT_ENQUIRY" ? "Company" : "Restaurant", value: detail.companyOrRestaurant });
  }
  if (detail.email) rows.push({ label: "Email", value: detail.email });
  if (detail.phone) rows.push({ label: "Phone", value: detail.phone });
  if (detail.cityOrCountry) {
    rows.push({ label: detail.leadType === "PROJECT_ENQUIRY" ? "Country" : "City", value: detail.cityOrCountry });
  }
  if (detail.submittedFields["Role"]) rows.push({ label: "Role", value: detail.submittedFields["Role"] });
  if (detail.submittedFields["Country code"]) {
    rows.push({ label: "Country code", value: detail.submittedFields["Country code"] });
  }
  return rows;
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
        <Link href="/admin/leads" className={styles.backLink}>
          ← Back to leads
        </Link>
      </div>
    );
  }

  if (!detail) {
    return <p className={styles.loading}>Loading…</p>;
  }

  const isProjectEnquiry = detail.leadType === "PROJECT_ENQUIRY";
  const grouped = isProjectEnquiry ? groupProjectEnquiryFields(detail.submittedFields) : null;
  const flatFields = Object.entries(detail.submittedFields).map(([label, value]) => ({ label, value }));

  return (
    <div>
      <Link href={isProjectEnquiry ? "/admin/project-enquiries" : "/admin/leads"} className={styles.backLink}>
        ← Back to {isProjectEnquiry ? "project enquiries" : "leads"}
      </Link>

      <div className={styles.header}>
        <div>
          <p className={styles.reference}>{detail.referenceNumber}</p>
          <h1 className={`text-h2 ${styles.heading}`}>{detail.customerName}</h1>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.typeTag}>{isProjectEnquiry ? "Project Enquiry" : "MESA Demo"}</span>
          <StatusPill status={detail.status} />
          <span className={styles.createdAt}>Created {new Date(detail.createdAt).toLocaleString()}</span>
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
          <DetailSectionCard title="Customer" rows={customerSectionRows(detail)} />

          {isProjectEnquiry
            ? grouped!.sections.map((section) => <DetailSectionCard key={section.title} {...section} />)
            : flatFields.length > 0 && <DetailSectionCard title="Submitted Details" rows={flatFields} />}
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

          {isProjectEnquiry && grouped!.attribution.rows.length > 0 && <DetailSectionCard {...grouped!.attribution} />}
          {isProjectEnquiry && grouped!.additional.rows.length > 0 && <DetailSectionCard {...grouped!.additional} />}

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

          <ActivityTimeline activity={detail.activity} />
        </div>
      </div>
    </div>
  );
}
