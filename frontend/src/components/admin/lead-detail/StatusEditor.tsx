"use client";

import { useState } from "react";
import { LEAD_STATUSES, LOST_REASONS } from "@/lib/admin/types";
import { humanizeStatus } from "@/components/admin/LeadStatusBadge";
import styles from "./panels.module.css";

export function StatusEditor({
  currentStatus,
  onSave,
  saving,
}: {
  currentStatus: string;
  onSave: (status: string, lostReason?: string) => Promise<boolean>;
  saving: boolean;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [lostReason, setLostReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDirty = status !== currentStatus;
  const needsLostReason = status === "LOST";

  async function handleSave() {
    setError(null);
    if (needsLostReason && !lostReason) {
      setError("Choose a lost reason.");
      return;
    }
    const ok = await onSave(status, needsLostReason ? lostReason : undefined);
    if (!ok) setError("Could not update status. Please try again.");
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Status</h2>
      <div className={styles.field}>
        <label htmlFor="status-select">Current status</label>
        <select id="status-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={saving}>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanizeStatus(s)}
            </option>
          ))}
        </select>
      </div>

      {needsLostReason && (
        <div className={styles.field}>
          <label htmlFor="lost-reason-select">Lost reason</label>
          <select
            id="lost-reason-select"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            disabled={saving}
          >
            <option value="">Select…</option>
            {LOST_REASONS.map((r) => (
              <option key={r} value={r}>
                {humanizeStatus(r)}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className="btn btnPrimary" onClick={handleSave} disabled={!isDirty || saving}>
        {saving ? "Saving…" : "Update status"}
      </button>
    </div>
  );
}
