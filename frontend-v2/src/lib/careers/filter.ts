import { JOB_TEAM_LABELS, type JobOpening, type JobTeam } from "./types";

export interface JobFilters {
  keyword: string;
  team: JobTeam | "ALL";
}

export const EMPTY_JOB_FILTERS: JobFilters = { keyword: "", team: "ALL" };

/**
 * Pure client-side filter over the (small, static) job dataset — W3.3A §29
 * is explicit that a handful of roles doesn't warrant a search backend.
 * Keyword matches title, team label and skill tags (§6's own examples —
 * "Java", "AI", "React", "Marketing" — are role/skill/team words, not
 * full-text JD search).
 */
export function filterJobs(jobs: JobOpening[], filters: JobFilters): JobOpening[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return jobs.filter((job) => {
    if (filters.team !== "ALL" && job.team !== filters.team) return false;

    if (!keyword) return true;
    const haystack = [job.title, JOB_TEAM_LABELS[job.team], ...job.skills].join(" ").toLowerCase();
    return haystack.includes(keyword);
  });
}

/**
 * The one open-roles-count phrasing used everywhere a count is shown (the
 * hero, Current Openings, and each career family) — a single source so the
 * wording can't drift between "6 open roles" in one place and something
 * else elsewhere, and so no count is ever a separately hardcoded number.
 */
export function formatOpenRolesCount(count: number): string {
  if (count === 0) return "No open roles right now";
  if (count === 1) return "1 open role";
  return `${count} open roles`;
}
