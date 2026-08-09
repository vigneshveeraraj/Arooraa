import type { FormFieldErrors, ProjectEnquiryFormValues } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mirrors backend InternationalPhoneNormalizer: optional leading '+', 7-15 digits, first non-zero.
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;
const DESCRIPTION_MIN_LENGTH = 20;

export function isValidInternationalPhone(raw: string): boolean {
  const cleaned = raw.trim().replace(/[\s\-().]/g, "");
  return PHONE_PATTERN.test(cleaned);
}

/** Which form step (0-indexed) each field belongs to, used to route users back to a step
 * that a backend validation error refers to. */
export const FIELD_TO_STEP: Record<keyof ProjectEnquiryFormValues, number> = {
  serviceType: 0,
  projectType: 1,
  companyName: 1,
  description: 1,
  existingSystem: 1,
  budgetRange: 2,
  timeline: 2,
  name: 3,
  businessEmail: 3,
  phone: 3,
  country: 3,
  preferredContactMethod: 3,
  website: 3,
};

export function validateStep(step: number, values: ProjectEnquiryFormValues): FormFieldErrors {
  const errors: FormFieldErrors = {};

  if (step === 0) {
    if (!values.serviceType) errors.serviceType = "Choose what you need help with.";
  }

  if (step === 1) {
    if (!values.projectType) errors.projectType = "Choose a project type.";
    if (!values.description.trim()) {
      errors.description = "Tell us about your idea or business problem.";
    } else if (values.description.trim().length < DESCRIPTION_MIN_LENGTH) {
      errors.description = `Please add a bit more detail (at least ${DESCRIPTION_MIN_LENGTH} characters).`;
    }
    if (!values.existingSystem) errors.existingSystem = "Let us know if an existing system is involved.";
  }

  if (step === 2) {
    if (!values.budgetRange) errors.budgetRange = "Choose a budget range.";
    if (!values.timeline) errors.timeline = "Choose a timeline.";
  }

  if (step === 3) {
    if (!values.name.trim()) errors.name = "Enter your name.";
    if (!values.businessEmail.trim()) {
      errors.businessEmail = "Enter your business email.";
    } else if (!EMAIL_PATTERN.test(values.businessEmail.trim())) {
      errors.businessEmail = "Enter a valid email address.";
    }
    if (!values.phone.trim()) {
      errors.phone = "Enter your phone number.";
    } else if (!isValidInternationalPhone(values.phone)) {
      errors.phone = "Enter a valid phone number, including country code.";
    }
    if (!values.country.trim()) errors.country = "Enter your country.";
    if (!values.preferredContactMethod) errors.preferredContactMethod = "Choose a preferred contact method.";
  }

  return errors;
}

export function validateAll(values: ProjectEnquiryFormValues): FormFieldErrors {
  return {
    ...validateStep(0, values),
    ...validateStep(1, values),
    ...validateStep(2, values),
    ...validateStep(3, values),
  };
}
