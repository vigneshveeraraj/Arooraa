"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { fetchLeads, type LeadListParams } from "@/lib/admin/api";
import { LEAD_STATUSES, type AdminLeadSummary, type LeadType } from "@/lib/admin/types";
import { humanizeStatus } from "@/components/admin/LeadStatusBadge";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export default function AdminLeadsListPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        {/* useSearchParams() must stay under Suspense — see the same note on the lead
            detail page. It's also what makes a deep link like ?leadType=... apply
            correctly when arrived at via client-side navigation. */}
        <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
          <LeadsListContent />
        </Suspense>
      </AdminShell>
    </RequireAdmin>
  );
}

function LeadsListContent() {
  const searchParams = useSearchParams();
  const initialLeadType = searchParams.get("leadType");

  // useState's initial value is only used on this component's first render, which is
  // exactly what we want — a one-time seed from the URL the filter buttons then own.
  const [leadType, setLeadType] = useState<LeadType | "">(
    initialLeadType === "PROJECT_ENQUIRY" || initialLeadType === "MESA_DEMO" ? initialLeadType : "",
  );
  const [status, setStatus] = useState("");
  const [followUp, setFollowUp] = useState<LeadListParams["followUp"] | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [leads, setLeads] = useState<AdminLeadSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLeads({
      leadType: leadType || undefined,
      status: status || undefined,
      followUp: followUp || undefined,
      search: search || undefined,
      timezone: resolveTimezone(),
      page,
      size: PAGE_SIZE,
    }).then((result) => {
      setLoading(false);
      if (result.ok) {
        setLeads(result.data.content);
        setTotalPages(result.data.page.totalPages);
        setTotalElements(result.data.page.totalElements);
      } else {
        setError(result.error.message);
      }
    });
  }, [leadType, status, followUp, search, page]);

  useEffect(() => {
    // Re-fetching whenever a filter changes is syncing with an external system (the
    // backend), not derived state — the canonical data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  return (
    <div>
      <h1 className={styles.heading}>Leads</h1>

      <div className={styles.filters}>
        <div className={styles.typeFilter}>
          {(["", "PROJECT_ENQUIRY", "MESA_DEMO"] as const).map((option) => (
            <button
              key={option || "all"}
              type="button"
              className={`${styles.typeButton} ${leadType === option ? styles.typeButtonActive : ""}`}
              onClick={() => {
                setPage(0);
                setLeadType(option);
              }}
            >
              {option === "" ? "All" : option === "PROJECT_ENQUIRY" ? "Project" : "MESA"}
            </button>
          ))}
        </div>

        <select
          aria-label="Status filter"
          className={styles.select}
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanizeStatus(s)}
            </option>
          ))}
        </select>

        <select
          aria-label="Follow-up filter"
          className={styles.select}
          value={followUp}
          onChange={(e) => {
            setPage(0);
            setFollowUp(e.target.value as LeadListParams["followUp"] | "");
          }}
        >
          <option value="">Any follow-up</option>
          <option value="DUE_TODAY">Due today</option>
          <option value="OVERDUE">Overdue</option>
          <option value="ANY_SET">Follow-up set</option>
        </select>

        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="search"
            aria-label="Search leads"
            placeholder="Search reference, name, company, email, phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <>
          <LeadsTable leads={leads} />

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className={styles.pageButton}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages} ({totalElements} leads)
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className={styles.pageButton}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
