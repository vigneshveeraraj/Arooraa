"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getOpenJobs } from "@/lib/careers/jobs";
import { EMPTY_JOB_FILTERS, filterJobs, formatOpenRolesCount, type JobFilters } from "@/lib/careers/filter";
import { JOB_TEAM_LABELS, type JobOpening, type JobTeam } from "@/lib/careers/types";
import { CURRENT_OPENINGS_HEADING, JOB_SEARCH_CONTENT } from "@/lib/content/careers";
import { JobCard } from "./shared/JobCard";
import styles from "./CurrentOpeningsSection.module.css";

const TEAM_FILTER_OPTIONS: JobTeam[] = ["ENGINEERING", "AI_DATA", "PRODUCT_DESIGN", "SALES", "MARKETING"];

/**
 * "Find your next opportunity" search/filter toolbar plus "Current
 * openings" results (W3.3A §6–9, §29). Filters only ever run over
 * getOpenJobs() — the small, static dataset doesn't need a search backend,
 * and only genuinely OPEN roles ever belong in this section (§30: closed
 * and planned roles never appear in the default listing).
 *
 * Every openings count on this page is this same computed value — never a
 * separately hardcoded number (§7).
 */
interface CurrentOpeningsSectionProps {
  /** Test-only seam — the live page always uses the real getOpenJobs() dataset. */
  jobs?: JobOpening[];
}

export function CurrentOpeningsSection({ jobs }: CurrentOpeningsSectionProps = {}) {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS);
  const openJobs = useMemo(() => jobs ?? getOpenJobs(), [jobs]);
  const filteredJobs = useMemo(() => filterJobs(openJobs, filters), [openJobs, filters]);
  const filtersActive = filters.keyword.trim() !== "" || filters.team !== "ALL";

  return (
    <Section id="open-roles">
      <Container>
        <p className="text-eyebrow">{CURRENT_OPENINGS_HEADING.eyebrow}</p>
        <h2 className={`text-h2 ${styles.title}`}>{JOB_SEARCH_CONTENT.heading}</h2>

        <div className={styles.toolbar} role="search">
          <div className={styles.searchField}>
            <label htmlFor="job-search-keyword" className={styles.label}>
              {JOB_SEARCH_CONTENT.searchLabel}
            </label>
            <input
              id="job-search-keyword"
              type="text"
              placeholder={JOB_SEARCH_CONTENT.searchPlaceholder}
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.teamField}>
            <label htmlFor="job-search-team" className={styles.label}>
              {JOB_SEARCH_CONTENT.teamFilterLabel}
            </label>
            <select
              id="job-search-team"
              value={filters.team}
              onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value as JobTeam | "ALL" }))}
              className={styles.teamSelect}
            >
              <option value="ALL">{JOB_SEARCH_CONTENT.allTeamsLabel}</option>
              {TEAM_FILTER_OPTIONS.map((team) => (
                <option key={team} value={team}>
                  {JOB_TEAM_LABELS[team]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className={`text-label ${styles.count}`} aria-live="polite">
          {formatOpenRolesCount(filteredJobs.length)}
        </p>

        <div className={styles.subheading}>
          <h3 className="text-h3">{CURRENT_OPENINGS_HEADING.title}</h3>
          <p className={`text-body-lg ${styles.description}`}>{CURRENT_OPENINGS_HEADING.description}</p>
        </div>

        {filteredJobs.length > 0 ? (
          <ul className={styles.grid}>
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        ) : filtersActive && openJobs.length > 0 ? (
          <div className={styles.empty}>
            <p className="text-h4">{JOB_SEARCH_CONTENT.noResults.heading}</p>
            <p className="text-body-sm">{JOB_SEARCH_CONTENT.noResults.body}</p>
            <div className={styles.emptyActions}>
              <Button variant="secondary" onClick={() => setFilters(EMPTY_JOB_FILTERS)}>
                {JOB_SEARCH_CONTENT.noResults.clearLabel}
              </Button>
              <Button href="#talent-community">{JOB_SEARCH_CONTENT.noResults.alertsLabel}</Button>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className="text-h4">{JOB_SEARCH_CONTENT.noOpenRoles.heading}</p>
            <p className="text-body-sm">{JOB_SEARCH_CONTENT.noOpenRoles.body}</p>
            <div className={styles.emptyActions}>
              <Button variant="secondary" href="#planned-roles">
                {JOB_SEARCH_CONTENT.noOpenRoles.plannedRolesLabel}
              </Button>
              <Button href="#talent-community">{JOB_SEARCH_CONTENT.noOpenRoles.alertsLabel}</Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
