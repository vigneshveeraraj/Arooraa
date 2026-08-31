import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import type { JobOpening } from "@/lib/careers/types";
import { JobHeader } from "./JobHeader";
import { JobSidePanel } from "./JobSidePanel";
import { JobBody } from "./JobBody";
import { RelatedRoles } from "./RelatedRoles";
import styles from "./JobDetailLayout.module.css";

interface JobDetailLayoutProps {
  job: JobOpening;
}

/**
 * Single source of DOM markup for both breakpoints (W3.3A §16–17, §39): the
 * side panel sits in normal flow right after the header on mobile, and
 * becomes a sticky right-hand column at desktop — a CSS grid reflow, not two
 * separately rendered components.
 */
export function JobDetailLayout({ job }: JobDetailLayoutProps) {
  return (
    <main>
      <Section spacing="compact">
        <Container>
          <div className={styles.grid}>
            <div className={styles.headerArea}>
              <JobHeader job={job} />
            </div>
            <div className={styles.panelArea}>
              <JobSidePanel job={job} />
            </div>
            <div className={styles.bodyArea}>
              <JobBody job={job} />
              <RelatedRoles currentSlug={job.slug} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
