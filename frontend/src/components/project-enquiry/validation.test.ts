import { describe, expect, it } from "vitest";
import { isValidInternationalPhone, validateAll, validateStep } from "./validation";
import { EMPTY_FORM_VALUES, type ProjectEnquiryFormValues } from "./types";

describe("isValidInternationalPhone", () => {
  it.each(["+919876543210", "+91 98765 43210", "+1 415-555-0132", "+44 20 7946 0958", "9876543210"])(
    "accepts %s",
    (value) => {
      expect(isValidInternationalPhone(value)).toBe(true);
    },
  );

  it.each(["12345", "abcdefghij", "0123456789", ""])("rejects %s", (value) => {
    expect(isValidInternationalPhone(value)).toBe(false);
  });
});

function validValues(overrides: Partial<ProjectEnquiryFormValues> = {}): ProjectEnquiryFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    serviceType: "CUSTOM_SOFTWARE",
    projectType: "NEW_PRODUCT",
    description: "We need a logistics tracking platform for our operations across five cities.",
    existingSystem: "no",
    budgetRange: "FROM_2L_TO_5L",
    timeline: "FROM_1_TO_3_MONTHS",
    name: "Arun Kumar",
    businessEmail: "arun@example.com",
    phone: "+919876543210",
    country: "India",
    preferredContactMethod: "PHONE",
    ...overrides,
  };
}

describe("validateStep", () => {
  it("returns no errors for a fully valid form, step by step", () => {
    const values = validValues();
    expect(validateStep(0, values)).toEqual({});
    expect(validateStep(1, values)).toEqual({});
    expect(validateStep(2, values)).toEqual({});
    expect(validateStep(3, values)).toEqual({});
  });

  it("flags step 0's serviceType when empty", () => {
    const errors = validateStep(0, EMPTY_FORM_VALUES);
    expect(Object.keys(errors)).toEqual(["serviceType"]);
  });

  it("flags step 1's required fields when empty", () => {
    const errors = validateStep(1, EMPTY_FORM_VALUES);
    expect(Object.keys(errors).sort()).toEqual(["description", "existingSystem", "projectType"].sort());
  });

  it("rejects a description shorter than 20 characters", () => {
    const errors = validateStep(1, validValues({ description: "too short" }));
    expect(errors.description).toBeDefined();
  });

  it("does not require companyName", () => {
    const errors = validateStep(1, validValues({ companyName: "" }));
    expect(errors.companyName).toBeUndefined();
  });

  it("flags step 2's required fields when empty", () => {
    const errors = validateStep(2, EMPTY_FORM_VALUES);
    expect(Object.keys(errors).sort()).toEqual(["budgetRange", "timeline"].sort());
  });

  it("flags step 3's required fields when empty", () => {
    const errors = validateStep(3, EMPTY_FORM_VALUES);
    expect(Object.keys(errors).sort()).toEqual(
      ["name", "businessEmail", "phone", "country", "preferredContactMethod"].sort(),
    );
  });

  it("rejects an invalid business email", () => {
    const errors = validateStep(3, validValues({ businessEmail: "not-an-email" }));
    expect(errors.businessEmail).toBeDefined();
  });

  it("rejects an invalid phone number", () => {
    const errors = validateStep(3, validValues({ phone: "12345" }));
    expect(errors.phone).toBeDefined();
  });
});

describe("validateAll", () => {
  it("returns no errors for a fully valid form", () => {
    expect(validateAll(validValues())).toEqual({});
  });

  it("aggregates errors across all steps for an empty form", () => {
    const errors = validateAll(EMPTY_FORM_VALUES);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(9);
  });
});
