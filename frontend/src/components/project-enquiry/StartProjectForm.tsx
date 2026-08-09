"use client";

import { type FormEvent, type ReactNode } from "react";
import { useStartProjectForm, STEP_COUNT } from "./useStartProjectForm";
import {
  BUDGET_RANGE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from "./options";
import styles from "./StartProjectForm.module.css";

const STEP_LABELS = ["What you need", "Your project", "Planning", "Contact"];

export function StartProjectForm() {
  const { values, currentStep, fieldErrors, submission, setField, goNext, goBack, submit, reset } =
    useStartProjectForm();

  const isSubmitting = submission.status === "submitting";
  const isSuccess = submission.status === "success";
  const isLastStep = currentStep === STEP_COUNT - 1;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isLastStep) {
      void submit();
    } else {
      goNext();
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.successPanel}>
        <h2 className={styles.successTitle}>
          {submission.kind === "RECEIVED" ? "Enquiry received" : "Already on it"}
        </h2>
        {submission.enquiryNumber && (
          <p className={styles.enquiryNumber}>
            Reference: <strong>{submission.enquiryNumber}</strong>
          </p>
        )}
        <p className={styles.successMessage}>{submission.message}</p>
        <p className={styles.successMessage}>
          We&apos;ll review your requirement and contact you using your preferred contact method.
        </p>
        <button type="button" className="btn btnPrimary" onClick={reset}>
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <ol className={styles.progress} aria-label="Form progress">
        {STEP_LABELS.map((label, index) => (
          <li
            key={label}
            className={`${styles.progressStep} ${index === currentStep ? styles.progressStepActive : ""} ${index < currentStep ? styles.progressStepDone : ""}`}
            aria-current={index === currentStep ? "step" : undefined}
          >
            <span className={styles.progressDot}>{index < currentStep ? "✓" : index + 1}</span>
            <span className={styles.progressLabel}>{label}</span>
          </li>
        ))}
      </ol>

      {submission.status === "error" && (
        <div className={styles.formError} role="alert">
          {submission.message}
        </div>
      )}

      {currentStep === 0 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.stepHeading}>What do you need?</legend>
          <Field label="I'm looking for" htmlFor="serviceType" error={fieldErrors.serviceType}>
            <select
              id="serviceType"
              name="serviceType"
              value={values.serviceType}
              onChange={(e) => setField("serviceType", e.target.value as typeof values.serviceType)}
              aria-invalid={!!fieldErrors.serviceType}
              autoFocus
            >
              <option value="">Select…</option>
              {SERVICE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
      )}

      {currentStep === 1 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.stepHeading}>Your project</legend>
          <Field label="Project type" htmlFor="projectType" error={fieldErrors.projectType}>
            <select
              id="projectType"
              name="projectType"
              value={values.projectType}
              onChange={(e) => setField("projectType", e.target.value as typeof values.projectType)}
              aria-invalid={!!fieldErrors.projectType}
            >
              <option value="">Select…</option>
              {PROJECT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Company name (optional)" htmlFor="companyName">
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              value={values.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
            />
          </Field>

          <Field
            label="Tell us about your idea or business problem"
            htmlFor="description"
            error={fieldErrors.description}
          >
            <textarea
              id="description"
              name="description"
              rows={4}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              aria-invalid={!!fieldErrors.description}
            />
          </Field>

          <Field label="Does this involve an existing system?" htmlFor="existingSystem" error={fieldErrors.existingSystem}>
            <select
              id="existingSystem"
              name="existingSystem"
              value={values.existingSystem}
              onChange={(e) => setField("existingSystem", e.target.value as typeof values.existingSystem)}
              aria-invalid={!!fieldErrors.existingSystem}
            >
              <option value="">Select…</option>
              <option value="yes">Yes, we have an existing system</option>
              <option value="no">No, this is new</option>
            </select>
          </Field>
        </fieldset>
      )}

      {currentStep === 2 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.stepHeading}>Planning</legend>
          <Field label="Budget range" htmlFor="budgetRange" error={fieldErrors.budgetRange}>
            <select
              id="budgetRange"
              name="budgetRange"
              value={values.budgetRange}
              onChange={(e) => setField("budgetRange", e.target.value as typeof values.budgetRange)}
              aria-invalid={!!fieldErrors.budgetRange}
            >
              <option value="">Select…</option>
              {BUDGET_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Timeline" htmlFor="timeline" error={fieldErrors.timeline}>
            <select
              id="timeline"
              name="timeline"
              value={values.timeline}
              onChange={(e) => setField("timeline", e.target.value as typeof values.timeline)}
              aria-invalid={!!fieldErrors.timeline}
            >
              <option value="">Select…</option>
              {TIMELINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
      )}

      {currentStep === 3 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.stepHeading}>Contact details</legend>
          <Field label="Your name" htmlFor="name" error={fieldErrors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              aria-invalid={!!fieldErrors.name}
            />
          </Field>

          <Field label="Business email" htmlFor="businessEmail" error={fieldErrors.businessEmail}>
            <input
              id="businessEmail"
              name="businessEmail"
              type="email"
              autoComplete="email"
              value={values.businessEmail}
              onChange={(e) => setField("businessEmail", e.target.value)}
              aria-invalid={!!fieldErrors.businessEmail}
            />
          </Field>

          <Field label="Phone" htmlFor="phone" error={fieldErrors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              aria-invalid={!!fieldErrors.phone}
            />
          </Field>

          <Field label="Country" htmlFor="country" error={fieldErrors.country}>
            <input
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              value={values.country}
              onChange={(e) => setField("country", e.target.value)}
              aria-invalid={!!fieldErrors.country}
            />
          </Field>

          <Field
            label="Preferred contact method"
            htmlFor="preferredContactMethod"
            error={fieldErrors.preferredContactMethod}
          >
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              value={values.preferredContactMethod}
              onChange={(e) => setField("preferredContactMethod", e.target.value as typeof values.preferredContactMethod)}
              aria-invalid={!!fieldErrors.preferredContactMethod}
            >
              <option value="">Select…</option>
              {CONTACT_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
      )}

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <div className={styles.navRow}>
        {currentStep > 0 && (
          <button type="button" className="btn btnGhostOnDark" onClick={goBack} disabled={isSubmitting}>
            Back
          </button>
        )}
        <button type="submit" className={`btn btnPrimary ${styles.nextBtn}`} disabled={isSubmitting}>
          {isLastStep ? (isSubmitting ? "Sending…" : "Submit Enquiry") : "Next"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
