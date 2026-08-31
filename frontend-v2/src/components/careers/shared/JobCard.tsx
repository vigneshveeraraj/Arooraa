import Link from "next/link";
import { JOB_TEAM_LABELS, type JobOpening } from "@/lib/careers/types";
import { PLANNED_ROLES_CONTENT } from "@/lib/content/careers";
import { Badge } from "@/components/ui/Badge";
import styles from "./JobCard.module.css";

interface JobCardProps {
  job: JobOpening;
}

/**
 * One job card, used both in "Current openings" (status OPEN) and any
 * future "Career paths we're building toward" (status PLANNED) roles — the
 * whole card is a single link (W3.3A §9, §39: easy to tap, no cramped
 * nested links), and the only thing that changes between the two contexts
 * is the badge/CTA copy, driven entirely by the job's own `status` field.
 */
export function JobCard({ job }: JobCardProps) {
  const isPlanned = job.status === "PLANNED";

  return (
    <Link href={`/careers/${job.slug}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={`text-h4 ${styles.title}`}>{job.title}</h3>
        <Badge variant="neutral">{JOB_TEAM_LABELS[job.team]}</Badge>
      </div>

      {isPlanned ? <p className={`text-label ${styles.plannedTag}`}>{PLANNED_ROLES_CONTENT.statusLabel}</p> : null}

      <p className={`text-body-sm ${styles.summary}`}>{job.summary}</p>

      <ul className={styles.skills} aria-label="Relevant skills">
        {job.skills.slice(0, 4).map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      <div className={styles.footer}>
        <span className={`text-body-sm ${styles.location}`}>{job.location}</span>
        <span className={styles.cta}>
          {isPlanned ? PLANNED_ROLES_CONTENT.cardCta : "View Role"}
          <span aria-hidden="true"> →</span>
        </span>
      </div>
    </Link>
  );
}
