"use client";

import { useRef } from "react";
import { describedBy, FormField } from "@/components/start-project/shared/FormField";
import { Button } from "@/components/ui/Button";
import type { JobApplicationAdapter } from "@/lib/careers/application-adapter";
import type { JobOpening } from "@/lib/careers/types";
import { JOB_APPLICATION_CONTENT } from "@/lib/content/careers";
import { useJobApplicationForm } from "./useJobApplicationForm";
import styles from "./JobApplicationForm.module.css";

interface JobApplicationFormProps {
  job: JobOpening;
  onCancel: () => void;
  /** Test-only override — the live page always gets the real backend-connected adapter. */
  adapter?: JobApplicationAdapter;
}

/** Portfolio/GitHub only makes sense for roles where it's actually relevant (W3.3A §15). */
const PORTFOLIO_RELEVANT_TEAMS = new Set(["ENGINEERING", "AI_DATA", "PRODUCT_DESIGN"]);

/**
 * The full apply-form contract for an OPEN role (W3.3A §15, connected to the real backend in
 * W3.3B §15): collects name/email/phone plus the optional fields, a real résumé upload, and
 * routes through the adapter, which now genuinely persists the application.
 */
export function JobApplicationForm({ job, onCancel, adapter }: JobApplicationFormProps) {
  const { values, resumeFile, errors, submission, setField, setResume, submit } = useJobApplicationForm(
    job.slug,
    job.title,
    adapter,
  );
  const { fields } = JOB_APPLICATION_CONTENT;
  const showPortfolio = PORTFOLIO_RELEVANT_TEAMS.has(job.team);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (submission.status === "success") {
    const { result } = submission;
    return (
      <div className={styles.notice} role="status">
        <p className="text-h4">{JOB_APPLICATION_CONTENT.successHeading}</p>
        <p className={`text-body-sm ${styles.noticeBody}`}>{result.message}</p>
        <dl className={styles.successDetails}>
          {result.applicationReference ? (
            <div>
              <dt>{JOB_APPLICATION_CONTENT.successReferenceLabel}</dt>
              <dd>{result.applicationReference}</dd>
            </div>
          ) : null}
          <div>
            <dt>{JOB_APPLICATION_CONTENT.successRoleLabel}</dt>
            <dd>{job.title}</dd>
          </div>
        </dl>
        <p className={`text-body-sm ${styles.noticeBody}`}>We&apos;ll be in touch at {values.email}.</p>
      </div>
    );
  }

  if (submission.status === "error") {
    return (
      <div className={styles.notice} role="alert">
        <p className={`text-body-sm ${styles.noticeBody}`}>{submission.message}</p>
        <Button variant="secondary" onClick={onCancel}>
          {JOB_APPLICATION_CONTENT.closeLabel}
        </Button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <FormField label={fields.fullName} htmlFor="apply-fullName" required error={errors.fullName}>
        <input
          id="apply-fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          aria-invalid={!!errors.fullName}
          aria-describedby={describedBy("apply-fullName", { error: !!errors.fullName })}
        />
      </FormField>

      <FormField label={fields.email} htmlFor="apply-email" required error={errors.email}>
        <input
          id="apply-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("apply-email", { error: !!errors.email })}
        />
      </FormField>

      <FormField label={fields.phone} htmlFor="apply-phone" required error={errors.phone}>
        <input
          id="apply-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => setField("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={describedBy("apply-phone", { error: !!errors.phone })}
        />
      </FormField>

      <FormField label={fields.currentLocation} htmlFor="apply-location">
        <input
          id="apply-location"
          name="currentLocation"
          type="text"
          value={values.currentLocation}
          onChange={(e) => setField("currentLocation", e.target.value)}
        />
      </FormField>

      <FormField label={fields.experience} htmlFor="apply-experience">
        <input
          id="apply-experience"
          name="experience"
          type="text"
          placeholder="e.g. 3 years"
          value={values.experience}
          onChange={(e) => setField("experience", e.target.value)}
        />
      </FormField>

      <FormField label={fields.linkedIn} htmlFor="apply-linkedin">
        <input
          id="apply-linkedin"
          name="linkedInUrl"
          type="url"
          placeholder="https://linkedin.com/in/…"
          value={values.linkedInUrl}
          onChange={(e) => setField("linkedInUrl", e.target.value)}
        />
      </FormField>

      {showPortfolio ? (
        <FormField label={fields.portfolio} htmlFor="apply-portfolio">
          <input
            id="apply-portfolio"
            name="portfolioUrl"
            type="url"
            placeholder="https://…"
            value={values.portfolioUrl}
            onChange={(e) => setField("portfolioUrl", e.target.value)}
          />
        </FormField>
      ) : null}

      <FormField label={fields.resume} htmlFor="apply-resume" helper={fields.resumeHelper} error={errors.resume}>
        <div className={styles.resumeRow}>
          <input
            ref={fileInputRef}
            id="apply-resume"
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-invalid={!!errors.resume}
            aria-describedby={describedBy("apply-resume", { helper: true, error: !!errors.resume })}
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
          />
          {resumeFile ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setResume(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              {fields.resumeRemoveLabel}
            </Button>
          ) : null}
        </div>
        {resumeFile ? <p className={`text-body-sm ${styles.resumeFilename}`}>{resumeFile.name}</p> : null}
      </FormField>

      <FormField label={fields.note} htmlFor="apply-note">
        <textarea id="apply-note" name="note" rows={4} value={values.note} onChange={(e) => setField("note", e.target.value)} />
      </FormField>

      <div className={styles.consent}>
        <label className={styles.consentLabel} htmlFor="apply-consent">
          <input
            id="apply-consent"
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setField("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("apply-consent", { error: !!errors.consent })}
          />
          <span>{JOB_APPLICATION_CONTENT.consentLabel}</span>
        </label>
        {errors.consent ? (
          <p id="apply-consent-error" role="alert" className={styles.error}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={submission.status === "submitting"}>
          {submission.status === "submitting" ? JOB_APPLICATION_CONTENT.submittingLabel : JOB_APPLICATION_CONTENT.submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {JOB_APPLICATION_CONTENT.cancelLabel}
        </Button>
      </div>
    </form>
  );
}
