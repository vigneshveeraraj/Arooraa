import Link from "next/link";
import {
  EMPLOYMENT_TYPE_LABELS,
  JOB_TEAM_LABELS,
  WORK_MODE_LABELS,
  type JobOpening,
} from "@/lib/careers/types";
import styles from "./JobHeader.module.css";

interface JobHeaderProps {
  job: JobOpening;
}

/**
 * Role, team, location, and only the work-arrangement / employment-type /
 * experience fields AROORAA has actually approved (W3.3A §14, §11) — an
 * absent field is simply not rendered, never filled with a guess.
 */
export function JobHeader({ job }: JobHeaderProps) {
  const meta = [
    JOB_TEAM_LABELS[job.team],
    job.location,
    job.workMode ? WORK_MODE_LABELS[job.workMode] : null,
    job.employmentType ? EMPLOYMENT_TYPE_LABELS[job.employmentType] : null,
    job.experience ?? null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className={styles.header}>
      <Link href="/careers#open-roles" className={styles.breadcrumb}>
        <span aria-hidden="true">← </span>Careers
      </Link>
      <h1 className={`text-h1 ${styles.title}`}>{job.title}</h1>
      <ul className={styles.meta}>
        {meta.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
