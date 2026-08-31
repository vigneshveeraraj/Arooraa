import { JOB_DETAIL_CONTENT } from "@/lib/content/careers";
import type { JobOpening } from "@/lib/careers/types";
import styles from "./JobBody.module.css";

interface JobBodyProps {
  job: JobOpening;
}

export function JobBody({ job }: JobBodyProps) {
  return (
    <div className={styles.body}>
      <section>
        <h2 className="text-h3">{JOB_DETAIL_CONTENT.aboutHeading}</h2>
        <p className={`text-body-lg ${styles.paragraph}`}>{job.aboutTheRole}</p>
      </section>

      <section>
        <h2 className="text-h3">{JOB_DETAIL_CONTENT.responsibilitiesHeading}</h2>
        <ul className={styles.list}>
          {job.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-h3">{JOB_DETAIL_CONTENT.qualificationsHeading}</h2>
        <ul className={styles.list}>
          {job.qualifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {job.preferredQualifications && job.preferredQualifications.length > 0 ? (
        <section>
          <h2 className="text-h3">{JOB_DETAIL_CONTENT.preferredQualificationsHeading}</h2>
          <ul className={styles.list}>
            {job.preferredQualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.howWeThink}>
        <h2 className="text-h3">{JOB_DETAIL_CONTENT.howWeThinkHeading}</h2>
        <p className={`text-body-lg ${styles.quote}`}>{job.howWeThinkAboutThisRole}</p>
      </section>
    </div>
  );
}
