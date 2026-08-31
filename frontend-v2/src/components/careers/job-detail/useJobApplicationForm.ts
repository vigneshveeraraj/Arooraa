"use client";

import { useCallback, useRef, useState } from "react";
import { realJobApplicationAdapter, type JobApplicationAdapter } from "@/lib/careers/application-adapter";
import {
  EMPTY_JOB_APPLICATION_VALUES,
  type JobApplicationFieldErrors,
  type JobApplicationFormValues,
  type JobApplicationSubmissionState,
} from "@/lib/careers/application-types";
import { validateJobApplicationForm } from "@/lib/careers/application-validation";

/**
 * Apply-form state (W3.3A §15, wired to the real backend in W3.3B). Accepts an adapter override
 * so tests can inject a fake adapter without a network call — the live page always uses the
 * real one.
 *
 * The idempotency key is generated once per mount (`useRef`, not `useState`, so it never
 * changes across re-renders) — every retry within one open apply-form session reuses the same
 * key (so a network-failure retry replays safely instead of risking a duplicate application),
 * but closing and reopening the form (a fresh mount) gets a fresh key. Deliberately not
 * persisted in sessionStorage the way Start a Project's draft key is: a candidate may apply to
 * a different role in the same browser session, and reusing one key across two different roles
 * would look like "same key, different payload" to the backend and surface as a conflict.
 */
export function useJobApplicationForm(
  jobSlug: string,
  jobTitle: string,
  adapter: JobApplicationAdapter = realJobApplicationAdapter,
) {
  const [values, setValues] = useState<JobApplicationFormValues>(EMPTY_JOB_APPLICATION_VALUES);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<JobApplicationFieldErrors>({});
  const [submission, setSubmission] = useState<JobApplicationSubmissionState>({ status: "idle" });
  const idempotencyKeyRef = useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : "");

  const setField = useCallback(<K extends keyof JobApplicationFormValues>(field: K, value: JobApplicationFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }, []);

  const setResume = useCallback((file: File | null) => {
    setResumeFile(file);
    setErrors((errs) => {
      if (!("resume" in errs)) return errs;
      const next = { ...errs };
      delete next.resume;
      return next;
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateJobApplicationForm(values, resumeFile);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmission({ status: "submitting" });

    const result = await adapter.submitApplication(
      {
        jobSlug,
        jobTitle,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        currentLocation: values.currentLocation.trim() || undefined,
        experience: values.experience.trim() || undefined,
        linkedInUrl: values.linkedInUrl.trim() || undefined,
        portfolioUrl: values.portfolioUrl.trim() || undefined,
        note: values.note.trim() || undefined,
        consent: true,
      },
      resumeFile,
      idempotencyKeyRef.current,
    );

    setSubmission(
      result.ok
        ? { status: "success", result: { applicationReference: result.applicationReference, jobSlug: result.jobSlug, message: result.message } }
        : { status: "error", message: result.message },
    );
  }, [values, resumeFile, adapter, jobSlug, jobTitle]);

  const reset = useCallback(() => {
    setValues(EMPTY_JOB_APPLICATION_VALUES);
    setResumeFile(null);
    setErrors({});
    setSubmission({ status: "idle" });
  }, []);

  return { values, resumeFile, errors, submission, setField, setResume, submit, reset };
}
