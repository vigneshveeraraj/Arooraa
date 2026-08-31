import { describe, expect, it } from "vitest";
import { validateContactForm } from "./validation";
import { EMPTY_CONTACT_FORM_VALUES, MESSAGE_MAX_LENGTH, type ContactFormValues } from "./types";

const VALID_VALUES: ContactFormValues = {
  ...EMPTY_CONTACT_FORM_VALUES,
  name: "Priya Sharma",
  email: "priya@example.com",
  reason: "GENERAL",
  message: "I have a general question about AROORAA.",
};

describe("validateContactForm", () => {
  it("passes with only the required fields filled", () => {
    expect(validateContactForm(VALID_VALUES)).toEqual({});
  });

  it("requires name, email, reason and message", () => {
    const errors = validateContactForm(EMPTY_CONTACT_FORM_VALUES);
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.reason).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    expect(validateContactForm({ ...VALID_VALUES, email: "not-an-email" }).email).toBeTruthy();
  });

  it("rejects an invalid phone number when one is provided", () => {
    expect(validateContactForm({ ...VALID_VALUES, phone: "abc" }).phone).toBeTruthy();
  });

  it("allows a blank phone number since it's optional", () => {
    expect(validateContactForm({ ...VALID_VALUES, phone: "" }).phone).toBeUndefined();
  });

  it("rejects a too-short message", () => {
    expect(validateContactForm({ ...VALID_VALUES, message: "hi" }).message).toBeTruthy();
  });

  it("rejects a message over the maximum length", () => {
    const errors = validateContactForm({ ...VALID_VALUES, message: "a".repeat(MESSAGE_MAX_LENGTH + 1) });
    expect(errors.message).toMatch(/2000 characters/i);
  });
});
