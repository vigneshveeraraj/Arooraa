import { JOB_TEAM_LABELS, type JobOpening } from "@/lib/careers/types";
import { JobApplyActions } from "./JobApplyPanel";
import styles from "./JobSidePanel.module.css";

interface JobSidePanelProps {
  job: JobOpening;
}

/**
 * Restrained sticky summary panel on desktop (W3.3A §16) — on mobile this
 * same markup simply sits in normal document flow right after the header
 * (see JobDetailLayout.module.css), which is what §16's "move this
 * information naturally into the top flow" means in practice: no separate
 * mobile-only component, just a different position in the same grid.
 */
export function JobSidePanel({ job }: JobSidePanelProps) {
  return (
    <aside className={styles.panel} aria-label="Role summary and apply">
      <p className="text-h4">{job.title}</p>
      <p className={`text-body-sm ${styles.team}`}>{JOB_TEAM_LABELS[job.team]}</p>
      <p className={`text-body-sm ${styles.location}`}>{job.location}</p>
      <div className={styles.actions}>
        <JobApplyActions job={job} />
      </div>
    </aside>
  );
}
