import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPlannedJobs } from "@/lib/careers/jobs";
import { PLANNED_ROLES_CONTENT } from "@/lib/content/careers";
import { JobCard } from "./shared/JobCard";
import styles from "./PlannedRolesSection.module.css";

/**
 * "Career paths we're building toward" — the honest home for any future
 * role while it's PLANNED rather than a genuine open vacancy. All six
 * current roles are OPEN, so this section renders nothing today; it stays
 * in the tree so a future PLANNED role has an honest place to live without
 * being mixed into Current Openings.
 */
export function PlannedRolesSection() {
  const plannedJobs = getPlannedJobs();
  if (plannedJobs.length === 0) return null;

  return (
    <Section id="planned-roles" spacing="compact">
      <Container>
        <SectionHeading
          eyebrow={PLANNED_ROLES_CONTENT.eyebrow}
          title={PLANNED_ROLES_CONTENT.title}
          description={PLANNED_ROLES_CONTENT.description}
        />

        <ul className={styles.grid}>
          {plannedJobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
