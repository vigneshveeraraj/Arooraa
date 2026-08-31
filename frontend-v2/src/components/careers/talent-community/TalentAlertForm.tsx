"use client";

import { describedBy, FormField } from "@/components/start-project/shared/FormField";
import { ChipOption } from "@/components/start-project/shared/ChipOption";
import { Button } from "@/components/ui/Button";
import {
  AREA_OF_INTEREST_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  type AreaOfInterest,
  type CandidateExperienceLevel,
} from "@/lib/careers/alerts-types";
import { TALENT_COMMUNITY_CONTENT } from "@/lib/content/careers";
import type { TalentAlertAdapter } from "@/lib/careers/alerts-adapter";
import { useTalentAlertForm } from "./useTalentAlertForm";
import styles from "./TalentAlertForm.module.css";

interface TalentAlertFormProps {
  /** Test-only override — the live page always gets the "not connected yet" adapter. */
  adapter?: TalentAlertAdapter;
}

export function TalentAlertForm({ adapter }: TalentAlertFormProps = {}) {
  const { values, errors, submission, setField, toggleAreaOfInterest, submit, reset } = useTalentAlertForm(adapter);

  if (submission.status === "success") {
    return (
      <div className={styles.success} role="status">
        <p className="text-h3">{TALENT_COMMUNITY_CONTENT.successHeading}</p>
        <p className={`text-body-lg ${styles.successBody}`}>{submission.message || TALENT_COMMUNITY_CONTENT.successBody}</p>
        <Button variant="secondary" onClick={reset}>
          Add another signup
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
      <div className={styles.nameEmailRow}>
        <FormField label="Name" htmlFor="alert-name" required error={errors.name}>
          <input
            id="alert-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("alert-name", { error: !!errors.name })}
          />
        </FormField>

        <FormField label="Email address" htmlFor="alert-email" required error={errors.email}>
          <input
            id="alert-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("alert-email", { error: !!errors.email })}
          />
        </FormField>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Areas of interest<span aria-hidden="true"> *</span>
        </legend>
        <div className={styles.chipRow}>
          {AREA_OF_INTEREST_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              type="checkbox"
              name="areasOfInterest"
              value={option.value}
              checked={values.areasOfInterest.includes(option.value)}
              onChange={() => toggleAreaOfInterest(option.value as AreaOfInterest)}
              label={option.label}
            />
          ))}
        </div>
        {errors.areasOfInterest ? (
          <p role="alert" className={styles.error}>
            {errors.areasOfInterest}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Experience level</legend>
        <div className={styles.chipRow}>
          {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
            <ChipOption
              key={option.value}
              name="experienceLevel"
              value={option.value}
              checked={values.experienceLevel === option.value}
              onChange={(v) => setField("experienceLevel", v as CandidateExperienceLevel)}
              label={option.label}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.consent}>
        <label className={styles.consentLabel} htmlFor="alert-consent">
          <input
            id="alert-consent"
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => setField("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("alert-consent", { error: !!errors.consent })}
          />
          <span>{TALENT_COMMUNITY_CONTENT.consentLabel}</span>
        </label>
        {errors.consent ? (
          <p id="alert-consent-error" role="alert" className={styles.error}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      {submission.status === "error" ? (
        <p role="alert" className={styles.formError}>
          {submission.message}
        </p>
      ) : null}

      <Button type="submit" disabled={submission.status === "submitting"}>
        {submission.status === "submitting" ? TALENT_COMMUNITY_CONTENT.submittingLabel : TALENT_COMMUNITY_CONTENT.submitLabel}
      </Button>
    </form>
  );
}
