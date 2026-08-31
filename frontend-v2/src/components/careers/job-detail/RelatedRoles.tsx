import { getRelatedJobs } from "@/lib/careers/jobs";
import { JOB_DETAIL_CONTENT } from "@/lib/content/careers";
import { JobCard } from "../shared/JobCard";
import styles from "./RelatedRoles.module.css";

interface RelatedRolesProps {
  currentSlug: string;
}

export function RelatedRoles({ currentSlug }: RelatedRolesProps) {
  const relatedJobs = getRelatedJobs(currentSlug);
  if (relatedJobs.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <h2 className="text-h3">{JOB_DETAIL_CONTENT.relatedHeading}</h2>
      <ul className={styles.grid}>
        {relatedJobs.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </ul>
    </div>
  );
}
