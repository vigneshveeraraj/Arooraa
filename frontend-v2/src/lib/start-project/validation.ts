import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { countryNameFor } from "./countries";
import { SOLUTION_MODELS_WITH_EXISTING_SYSTEM, type FormFieldErrors, type StartProjectFormValues } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROBLEM_STATEMENT_MIN_LENGTH = 20;
export const PROBLEM_STATEMENT_MAX_LENGTH = 3000;
export const NAME_MAX_LENGTH = 100;

/**
 * Country-aware phone validation (W3.2A.1 §1–3) — delegates entirely to
 * libphonenumber-js's real per-country metadata (length, leading-digit
 * patterns) rather than a single broad E.164-shaped regex. `nationalNumber`
 * is the digits the visitor typed (no country calling code in it — the
 * selected country supplies that).
 */
export function isValidNationalPhone(nationalNumber: string, iso2: string): boolean {
  if (!iso2 || !nationalNumber.trim()) return false;
  try {
    return isValidPhoneNumber(nationalNumber, iso2 as CountryCode);
  } catch {
    return false;
  }
}

/** E.164 canonical value ("+919876543210", no spaces) for the submission
 * payload — undefined if the number isn't actually valid for the country. */
export function toE164(nationalNumber: string, iso2: string): string | undefined {
  if (!iso2 || !nationalNumber.trim()) return undefined;
  try {
    const parsed = parsePhoneNumberFromString(nationalNumber, iso2 as CountryCode);
    return parsed?.isValid() ? parsed.number : undefined;
  } catch {
    return undefined;
  }
}

/** Keeps the first 3 and last 2 characters visible for the success screen's
 * "appropriate display" of the contact number (W3.2A §25). */
export function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 6) return trimmed;
  const visibleStart = trimmed.slice(0, 3);
  const visibleEnd = trimmed.slice(-2);
  const maskedLength = Math.max(trimmed.length - 5, 3);
  return `${visibleStart}${"•".repeat(maskedLength)}${visibleEnd}`;
}

export function solutionModelNeedsExistingSystemContext(solutionModel: StartProjectFormValues["solutionModel"]): boolean {
  return solutionModel !== "" && SOLUTION_MODELS_WITH_EXISTING_SYSTEM.includes(solutionModel);
}

/** Which wizard step (0-indexed) each field belongs to — routes a submission
 * error back to the step that needs attention. Review/honeypot aren't user-facing steps. */
export const FIELD_TO_STEP: Record<keyof StartProjectFormValues, number> = {
  solutionModel: 0,
  engagementModel: 0,
  problemStatement: 1,
  projectStage: 1,
  productTypes: 1,
  timeline: 1,
  budgetRange: 1,
  existingSystemContext: 1,
  name: 2,
  email: 2,
  phone: 2,
  country: 2,
  company: 2,
  role: 2,
  preferredContactMethod: 2,
  whatsappConsent: 2,
  preferredContactTime: 2,
  website: 2,
};

export function validateStep(step: number, values: StartProjectFormValues): FormFieldErrors {
  const errors: FormFieldErrors = {};

  if (step === 0) {
    if (!values.solutionModel) errors.solutionModel = "Choose the closest direction — “not sure” is a valid answer.";
    if (!values.engagementModel) errors.engagementModel = "Choose how you’d like AROORAA to help.";
  }

  if (step === 1) {
    const problem = values.problemStatement.trim();
    if (!problem) {
      errors.problemStatement = "Tell us what you're trying to build, improve or solve.";
    } else if (problem.length < PROBLEM_STATEMENT_MIN_LENGTH) {
      errors.problemStatement = `Please add a bit more detail (at least ${PROBLEM_STATEMENT_MIN_LENGTH} characters).`;
    } else if (problem.length > PROBLEM_STATEMENT_MAX_LENGTH) {
      errors.problemStatement = `Please keep this under ${PROBLEM_STATEMENT_MAX_LENGTH} characters.`;
    }
    if (!values.projectStage) errors.projectStage = "Let us know where things stand today.";
    if (!values.timeline) errors.timeline = "Choose a timeline.";
  }

  if (step === 2) {
    const name = values.name.trim();
    if (!name) {
      errors.name = "Enter your name.";
    } else if (name.length > NAME_MAX_LENGTH) {
      errors.name = `Please keep this under ${NAME_MAX_LENGTH} characters.`;
    }

    if (!values.email.trim()) {
      errors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!values.country) {
      errors.country = "Select your country.";
    }

    if (!values.phone.trim()) {
      errors.phone = "Enter your phone number.";
    } else if (!values.country) {
      // Can't validate a national number without knowing which country's
      // rules apply — the country error above already prompts for this.
      errors.phone = "Enter a valid phone number.";
    } else if (!isValidNationalPhone(values.phone, values.country)) {
      const countryName = countryNameFor(values.country);
      errors.phone = countryName ? `Enter a valid phone number for ${countryName}.` : "Enter a valid phone number.";
    }

    if (!values.preferredContactMethod) {
      errors.preferredContactMethod = "Choose how you'd prefer to be contacted.";
    }

    if (values.preferredContactMethod === "WHATSAPP" && !values.whatsappConsent) {
      errors.whatsappConsent = "Please confirm you're okay with AROORAA contacting you on WhatsApp.";
    }
  }

  return errors;
}

export function validateAll(values: StartProjectFormValues): FormFieldErrors {
  return {
    ...validateStep(0, values),
    ...validateStep(1, values),
    ...validateStep(2, values),
  };
}
