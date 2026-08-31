/**
 * W3.3A — AROORAA Careers. Canonical job-opening data model.
 *
 * Field honesty rule (W3.3A §11, §46): fields AROORAA has not actually
 * approved public values for (workMode, employmentType, experience) stay
 * optional and are simply omitted from every job below rather than filled
 * with a plausible-looking guess. UI must never invent display text for an
 * absent field — omit the row entirely.
 *
 * `status` is "OPEN" | "PLANNED" | "CLOSED". The six current roles are all
 * OPEN (confirmed current AROORAA openings). PLANNED and CLOSED remain part
 * of the model for future use: PLANNED roles get a full detail page but
 * never appear in "Current openings" and never show an Apply CTA; CLOSED
 * roles keep their detail page for continuity but also show no Apply CTA.
 */

export type JobTeam = "AI_DATA" | "ENGINEERING" | "PRODUCT_DESIGN" | "SALES" | "MARKETING";

export const JOB_TEAM_LABELS: Record<JobTeam, string> = {
  AI_DATA: "AI & Data",
  ENGINEERING: "Engineering",
  PRODUCT_DESIGN: "Product & Design",
  SALES: "Sales",
  MARKETING: "Marketing",
};

export type WorkMode = "ON_SITE" | "HYBRID" | "REMOTE";

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ON_SITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export type JobStatus = "OPEN" | "PLANNED" | "CLOSED";

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  team: JobTeam;
  location: string;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  experience?: string;
  /** Short 1–2 sentence description for the job card — never the full JD. */
  summary: string;
  aboutTheRole: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications?: string[];
  /** Short chips shown on the card and matched by keyword search. */
  skills: string[];
  /** AROORAA-specific "how we think about this role" closing section. */
  howWeThinkAboutThisRole: string;
  status: JobStatus;
  postedAt?: string;
}
