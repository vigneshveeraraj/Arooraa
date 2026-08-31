"use client";

import { useEffect, useState } from "react";
import { fetchActiveAdmins } from "@/lib/admin/api";
import type { AdminUserSummary, ManagementInfo } from "@/lib/admin/types";
import { Button } from "@/components/ui/Button";
import styles from "./panels.module.css";

/** Converts a UTC ISO instant to the value a <input type="datetime-local"> needs, in the browser's local time. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function ManagementEditor({
  info,
  onSaveFollowUp,
  onSaveAssignment,
  onSaveEstimatedValue,
  saving,
}: {
  info: ManagementInfo;
  onSaveFollowUp: (followUpAt: string | null) => Promise<boolean>;
  onSaveAssignment: (assignedAdminId: string | null) => Promise<boolean>;
  onSaveEstimatedValue: (value: number | null, currency: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [admins, setAdmins] = useState<AdminUserSummary[]>([]);
  const [assignedAdminId, setAssignedAdminId] = useState(info.assignedAdminId ?? "");
  const [followUpLocal, setFollowUpLocal] = useState(toLocalInputValue(info.followUpAt));
  const [estimatedValue, setEstimatedValue] = useState(info.estimatedValue?.toString() ?? "");
  const [currency, setCurrency] = useState(info.estimatedValueCurrency ?? "INR");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchActiveAdmins().then((result) => {
      if (result.ok) setAdmins(result.data);
    });
  }, []);

  async function handleAssignmentSave() {
    const ok = await onSaveAssignment(assignedAdminId || null);
    setErrors((e) => ({ ...e, assignment: ok ? "" : "Could not update assignment." }));
  }

  async function handleFollowUpSave() {
    const iso = followUpLocal ? new Date(followUpLocal).toISOString() : null;
    const ok = await onSaveFollowUp(iso);
    setErrors((e) => ({ ...e, followUp: ok ? "" : "Could not update follow-up." }));
  }

  async function handleEstimatedValueSave() {
    const parsed = estimatedValue.trim() === "" ? null : Number(estimatedValue);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setErrors((e) => ({ ...e, value: "Enter a valid non-negative amount." }));
      return;
    }
    const ok = await onSaveEstimatedValue(parsed, currency);
    setErrors((e) => ({ ...e, value: ok ? "" : "Could not update estimated value." }));
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Internal Management</h2>

      <div className={styles.field}>
        <label htmlFor="assigned-admin">Assigned to</label>
        <select
          id="assigned-admin"
          value={assignedAdminId}
          onChange={(e) => setAssignedAdminId(e.target.value)}
          disabled={saving}
        >
          <option value="">Unassigned</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.displayName}
            </option>
          ))}
        </select>
        {errors.assignment && <p className={styles.error}>{errors.assignment}</p>}
        <Button variant="secondary" onClick={handleAssignmentSave} disabled={saving}>
          Save assignment
        </Button>
      </div>

      <div className={styles.field}>
        <label htmlFor="follow-up-at">Next follow-up</label>
        <input
          id="follow-up-at"
          type="datetime-local"
          value={followUpLocal}
          onChange={(e) => setFollowUpLocal(e.target.value)}
          disabled={saving}
        />
        <p className={styles.hint}>Shown in your local time; stored as UTC.</p>
        {errors.followUp && <p className={styles.error}>{errors.followUp}</p>}
        <Button variant="secondary" onClick={handleFollowUpSave} disabled={saving}>
          Save follow-up
        </Button>
      </div>

      <div className={styles.field}>
        <label htmlFor="estimated-value">Estimated value</label>
        <div className={styles.row}>
          <input
            id="estimated-value"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 250000"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
            disabled={saving}
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={saving}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        {errors.value && <p className={styles.error}>{errors.value}</p>}
        <Button variant="secondary" onClick={handleEstimatedValueSave} disabled={saving}>
          Save estimated value
        </Button>
      </div>

      {info.lostReason && (
        <div className={styles.field}>
          <label>Lost reason</label>
          <p>{info.lostReason}</p>
        </div>
      )}
    </div>
  );
}
