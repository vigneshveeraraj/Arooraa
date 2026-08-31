import {
  BUDGET_RANGE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  ENGAGEMENT_MODEL_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  REVIEW_HEADING,
  REVIEW_SUPPORTING,
  RESPONSE_TIME_NOTE,
  SOLUTION_MODEL_OPTIONS,
  SUBMITTING_LABEL,
  SUBMIT_LABEL,
  TIMELINE_OPTIONS,
  TRY_AGAIN_LABEL,
} from "@/lib/content/start-project";
import { dialCodeFor } from "@/lib/start-project/countries";
import type { StartProjectFormValues, SubmissionState } from "@/lib/start-project/types";
import { Button } from "@/components/ui/Button";
import styles from "./ReviewStep.module.css";

interface ReviewStepProps {
  values: StartProjectFormValues;
  submission: SubmissionState;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

function labelOf<T extends string>(options: { value: T; label: string }[], value: T | ""): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}

function problemPreview(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
}

/** The pre-submit review block (W3.2A §23) — a concise summary with
 * per-section Edit links, not a repeat of the full problem statement. */
export function ReviewStep({ values, submission, onEdit, onSubmit }: ReviewStepProps) {
  const isSubmitting = submission.status === "submitting";
  const hasFailed = submission.status === "error";

  return (
    <div className={styles.content}>
      <h2 className="text-h2">{REVIEW_HEADING}</h2>
      <p className={`text-body ${styles.supporting}`}>{REVIEW_SUPPORTING}</p>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className="text-h4">Direction</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit(0)}>
            Edit
          </button>
        </div>
        <dl className={styles.summaryList}>
          <div>
            <dt>Direction</dt>
            <dd>{labelOf(SOLUTION_MODEL_OPTIONS, values.solutionModel)}</dd>
          </div>
          <div>
            <dt>Engagement</dt>
            <dd>{labelOf(ENGAGEMENT_MODEL_OPTIONS, values.engagementModel)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className="text-h4">Situation</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit(1)}>
            Edit
          </button>
        </div>
        <dl className={styles.summaryList}>
          <div>
            <dt>Stage</dt>
            <dd>{labelOf(PROJECT_STAGE_OPTIONS, values.projectStage)}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{labelOf(TIMELINE_OPTIONS, values.timeline)}</dd>
          </div>
          {values.budgetRange ? (
            <div>
              <dt>Budget</dt>
              <dd>{labelOf(BUDGET_RANGE_OPTIONS, values.budgetRange)}</dd>
            </div>
          ) : null}
        </dl>
        <p className={`text-body-sm ${styles.problemPreview}`}>“{problemPreview(values.problemStatement)}”</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3 className="text-h4">Contact</h3>
          <button type="button" className={styles.editLink} onClick={() => onEdit(2)}>
            Edit
          </button>
        </div>
        <dl className={styles.summaryList}>
          <div>
            <dt>Name</dt>
            <dd>{values.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{values.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{[dialCodeFor(values.country), values.phone].filter(Boolean).join(" ")}</dd>
          </div>
          <div>
            <dt>Preferred contact</dt>
            <dd>{labelOf(CONTACT_METHOD_OPTIONS, values.preferredContactMethod)}</dd>
          </div>
        </dl>
      </section>

      {submission.status === "error" ? (
        <div className={styles.errorBanner} role="alert">
          <p className={styles.errorHeading}>We couldn&apos;t send the enquiry yet.</p>
          <p>Your information is still here — please try again.</p>
        </div>
      ) : null}

      <p className={`text-body-sm ${styles.responseNote}`}>{RESPONSE_TIME_NOTE}</p>

      <Button variant="primary" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? SUBMITTING_LABEL : hasFailed ? TRY_AGAIN_LABEL : SUBMIT_LABEL}
      </Button>
    </div>
  );
}
