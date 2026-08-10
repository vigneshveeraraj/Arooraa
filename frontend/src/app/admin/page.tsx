"use client";

import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardCards, DashboardSplit } from "@/components/admin/DashboardCards";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { fetchDashboard, fetchLeads } from "@/lib/admin/api";
import type { AdminLeadSummary, DashboardSummary } from "@/lib/admin/types";
import styles from "./page.module.css";

function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <DashboardContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function DashboardContent() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentLeads, setRecentLeads] = useState<AdminLeadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timezone = resolveTimezone();
    let cancelled = false;

    (async () => {
      const [dashboardResult, leadsResult] = await Promise.all([
        fetchDashboard(timezone),
        fetchLeads({ page: 0, size: 10, timezone }),
      ]);
      if (cancelled) return;

      if (dashboardResult.ok) {
        setSummary(dashboardResult.data);
      } else {
        setError(dashboardResult.error.message);
      }
      if (leadsResult.ok) {
        setRecentLeads(leadsResult.data.content);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className={styles.heading}>Dashboard</h1>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {summary && (
        <>
          <DashboardCards summary={summary} />
          <DashboardSplit summary={summary} />
        </>
      )}

      <h2 className={styles.subheading}>Recent leads</h2>
      <LeadsTable leads={recentLeads} />
    </div>
  );
}
