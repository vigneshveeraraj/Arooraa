import type { JobApplicationFieldErrors, JobApplicationFormValues } from "./application-types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,20}$/;

/** Mirrors the backend's own accepted set/limit exactly (JobApplicationController, ResumeValidator) — client-side is a UX nicety, never the actual security boundary. */
export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export function validateJobApplicationForm(
  values: JobApplicationFormValues,
  resumeFile: File | null,
): JobApplicationFieldErrors {
  const errors: JobApplicationFieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Enter a phone number.";
  } else if (!PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (resumeFile) {
    if (!ALLOWED_RESUME_TYPES.includes(resumeFile.type)) {
      errors.resume = "Resume must be a PDF, DOC or DOCX file.";
    } else if (resumeFile.size > MAX_RESUME_SIZE_BYTES) {
      errors.resume = "Resume must be smaller than 5 MB.";
    }
  }

  if (!values.consent) {
    errors.consent = "Please confirm you consent to AROORAA using this information for recruitment.";
  }

  return errors;
}
