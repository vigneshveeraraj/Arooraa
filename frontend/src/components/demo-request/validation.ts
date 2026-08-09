import type { DemoRequestFormValues, FormFieldErrors } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidIndianMobile(raw: string): boolean {
  const cleaned = raw.replace(/[\s-]/g, "");
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) return true;
  if (/^91[6-9]\d{9}$/.test(cleaned) && cleaned.length === 12) return true;
  if (/^[6-9]\d{9}$/.test(cleaned)) return true;
  return false;
}

/**
 * Client-side pre-validation only, to give immediate feedback. The backend
 * remains the authoritative validator — this exists to avoid a round trip on
 * obviously incomplete/invalid input, not to fully replicate backend rules.
 */
export function validateDemoRequestForm(values: DemoRequestFormValues): FormFieldErrors {
  const errors: FormFieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your name.";
  }

  if (!values.whatsappNumber.trim()) {
    errors.whatsappNumber = "Enter your WhatsApp number.";
  } else if (!isValidIndianMobile(values.whatsappNumber)) {
    errors.whatsappNumber = "Enter a valid Indian mobile number.";
  }

  if (!values.businessEmail.trim()) {
    errors.businessEmail = "Enter your email address.";
  } else if (!EMAIL_REGEX.test(values.businessEmail.trim())) {
    errors.businessEmail = "Enter a valid email address.";
  }

  if (!values.restaurantName.trim()) {
    errors.restaurantName = "Enter your restaurant name.";
  }

  if (!values.city.trim()) {
    errors.city = "Enter your city.";
  }

  if (!values.outletCount) {
    errors.outletCount = "Select the number of outlets.";
  }

  if (!values.interestedProduct) {
    errors.interestedProduct = "Select what you're interested in.";
  }

  if (!values.preferredContactMethod) {
    errors.preferredContactMethod = "Select a preferred contact method.";
  }

  return errors;
}
