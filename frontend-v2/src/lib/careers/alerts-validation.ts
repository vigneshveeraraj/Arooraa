import type { TalentAlertFieldErrors, TalentAlertFormValues } from "./alerts-types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_MAX_LENGTH = 100;

export function validateTalentAlertForm(values: TalentAlertFormValues): TalentAlertFieldErrors {
  const errors: TalentAlertFieldErrors = {};

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

  if (values.areasOfInterest.length === 0) {
    errors.areasOfInterest = "Choose at least one area of interest.";
  }

  if (!values.consent) {
    errors.consent = "Please confirm you'd like to receive AROORAA career updates.";
  }

  return errors;
}
