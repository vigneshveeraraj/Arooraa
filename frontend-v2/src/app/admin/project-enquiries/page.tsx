"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectEnquiriesTable } from "@/components/admin/ProjectEnquiriesTable";
import { fetchLeads } from "@/lib/admin/api";
import { LEAD_STATUSES, type AdminLeadSummary } from "@/lib/admin/types";
import { humanizeStatus } from "@/components/admin/StatusPill";
import styles from "@/components/admin/shared/AdminListControls.module.css";

const PAGE_SIZE = 20;

/**
 * The focused project-enquiry inbox (W3.2D, migrated in W3.2D.1) —
 * leadType is always pinned to PROJECT_ENQUIRY, never exposed as a toggle.
 * Detail viewing/status changes reuse /admin/leads/detail and the existing
 * PATCH endpoint as-is; nothing about the Start Project flow or its data
 * model changes here.
 */
export default function AdminProjectEnquiriesPage() {
  return (
    <RequireAdmin>
      <AdminShell>
        <ProjectEnquiriesContent />
      </AdminShell>
    </RequireAdmin>
  );
}

function ProjectEnquiriesContent() {
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [enquiries, setEnquiries] = useState<AdminLeadSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLeads({
      leadType: "PROJECT_ENQUIRY",
      status: status || undefined,
      search: search || undefined,
      page,
      size: PAGE_SIZE,
    }).then((result) => {
      setLoading(false);
      if (result.ok) {
        setEnquiries(result.data.content);
        setTotalPages(result.data.page.totalPages);
        setTotalElements(result.data.page.totalElements);
      } else {
        setError(result.error.message);
      }
    });
  }, [status, search, page]);

  useEffect(() => {
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
      <h1 className={`text-h2 ${styles.heading}`}>Project Enquiries</h1>

      <div className={styles.filters}>
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

        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="search"
            aria-label="Search project enquiries"
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
          <ProjectEnquiriesTable enquiries={enquiries} />

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
                Page {page + 1} of {totalPages} ({totalElements} enquiries)
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
