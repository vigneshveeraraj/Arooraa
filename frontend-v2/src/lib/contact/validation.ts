import { MESSAGE_MAX_LENGTH, type ContactFieldErrors, type ContactFormValues } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,20}$/;
export const MESSAGE_MIN_LENGTH = 10;

export function validateContactForm(values: ContactFormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.reason) {
    errors.reason = "Choose what this is about.";
  }

  const message = values.message.trim();
  if (!message) {
    errors.message = "Enter your message.";
  } else if (message.length < MESSAGE_MIN_LENGTH) {
    errors.message = `Please share a little more detail (at least ${MESSAGE_MIN_LENGTH} characters).`;
  } else if (message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Please keep this under ${MESSAGE_MAX_LENGTH} characters.`;
  }

  return errors;
}
