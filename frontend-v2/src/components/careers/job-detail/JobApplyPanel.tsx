"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { JobApplicationAdapter } from "@/lib/careers/application-adapter";
import { JOB_DETAIL_CONTENT } from "@/lib/content/careers";
import type { JobOpening } from "@/lib/careers/types";
import { JobApplicationForm } from "./JobApplicationForm";
import { ShareRoleButton } from "./ShareRoleButton";
import styles from "./JobApplyPanel.module.css";

interface JobApplyPanelProps {
  job: JobOpening;
  /** Test-only override, threaded through to JobApplicationForm. */
  adapter?: JobApplicationAdapter;
}

/**
 * The Apply CTA (W3.3A §15) — branches entirely on job.status.
 *
 * PLANNED/CLOSED show a static notice — there's nothing to apply to, so no
 * adapter call is made. OPEN shows the "Apply for this role" button; clicking
 * it reveals the full JobApplicationForm inline. The form's own submit
 * always goes through notConnectedJobApplicationAdapter, which never reports
 * a fake success (no application backend exists yet — see the milestone
 * completion report).
 */
export function JobApplyPanel({ job, adapter }: JobApplyPanelProps) {
  const [applying, setApplying] = useState(false);

  if (job.status === "PLANNED") {
    return (
      <div className={styles.notice}>
        <p className="text-h4">{JOB_DETAIL_CONTENT.plannedNotice.title}</p>
        <p className={`text-body-sm ${styles.noticeBody}`}>{JOB_DETAIL_CONTENT.plannedNotice.body}</p>
        <Button href="/careers#talent-community">Join Job Alerts</Button>
      </div>
    );
  }

  if (job.status === "CLOSED") {
    return (
      <div className={styles.notice}>
        <p className="text-h4">{JOB_DETAIL_CONTENT.closedNotice.title}</p>
        <p className={`text-body-sm ${styles.noticeBody}`}>{JOB_DETAIL_CONTENT.closedNotice.body}</p>
        <Button href="/careers#talent-community">Join Job Alerts</Button>
      </div>
    );
  }

  if (applying) {
    return <JobApplicationForm job={job} onCancel={() => setApplying(false)} adapter={adapter} />;
  }

  return <Button onClick={() => setApplying(true)}>{JOB_DETAIL_CONTENT.applyCta}</Button>;
}

export function JobApplyActions({ job }: JobApplyPanelProps) {
  return (
    <div className={styles.actions}>
      <JobApplyPanel job={job} />
      <ShareRoleButton />
    </div>
  );
}
