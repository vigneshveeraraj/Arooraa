import { describe, expect, it } from "vitest";
import { EMPTY_FORM_VALUES, type StartProjectFormValues } from "./types";
import {
  isValidNationalPhone,
  maskPhone,
  solutionModelNeedsExistingSystemContext,
  toE164,
  validateAll,
  validateStep,
} from "./validation";

function values(overrides: Partial<StartProjectFormValues>): StartProjectFormValues {
  return { ...EMPTY_FORM_VALUES, ...overrides };
}

describe("isValidNationalPhone — country-aware (W3.2A.1)", () => {
  it("accepts a valid Indian mobile number", () => {
    expect(isValidNationalPhone("9876543210", "IN")).toBe(true);
  });

  it("rejects an Indian number that is too long", () => {
    expect(isValidNationalPhone("98765432100000", "IN")).toBe(false);
  });

  it("rejects an Indian number that is too short", () => {
    expect(isValidNationalPhone("98765", "IN")).toBe(false);
  });

  it("rejects letters even when mixed with otherwise-plausible digits", () => {
    expect(isValidNationalPhone("abc123xyz", "IN")).toBe(false);
  });

  it("accepts a valid Hong Kong number", () => {
    expect(isValidNationalPhone("51234567", "HK")).toBe(true);
  });

  it("rejects a Hong Kong number using the Indian 10-digit length", () => {
    expect(isValidNationalPhone("9876543210", "HK")).toBe(false);
  });

  it("accepts a valid US/Canada (NANP) number", () => {
    expect(isValidNationalPhone("4155550132", "US")).toBe(true);
  });

  it("returns false when no country is selected", () => {
    expect(isValidNationalPhone("9876543210", "")).toBe(false);
  });
});

describe("toE164 — canonical submission value", () => {
  it("produces a clean E.164 value for India with no spaces", () => {
    expect(toE164("9876543210", "IN")).toBe("+919876543210");
  });

  it("produces a clean E.164 value for Hong Kong", () => {
    expect(toE164("51234567", "HK")).toBe("+85251234567");
  });

  it("returns undefined for a number that is invalid for the given country", () => {
    expect(toE164("123", "IN")).toBeUndefined();
  });
});

describe("maskPhone", () => {
  it("keeps the first 3 and last 2 characters visible, masking the middle", () => {
    expect(maskPhone("+919876543210")).toBe("+91••••••••10");
  });

  it("masks a Hong Kong E.164 value (3-digit calling code, 8-digit national number) sensibly", () => {
    const masked = maskPhone("+85251234567");
    expect(masked.startsWith("+85")).toBe(true);
    expect(masked.endsWith("67")).toBe(true);
    expect(masked).not.toBe("+85251234567");
  });

  it("leaves very short values unmasked", () => {
    expect(maskPhone("+123")).toBe("+123");
  });
});

describe("solutionModelNeedsExistingSystemContext", () => {
  it("is true only for the solution models that involve an existing system", () => {
    expect(solutionModelNeedsExistingSystemContext("EXISTING_PRODUCT")).toBe(true);
    expect(solutionModelNeedsExistingSystemContext("APPLICATION_MODERNIZATION")).toBe(true);
    expect(solutionModelNeedsExistingSystemContext("CLOUD_PLATFORM")).toBe(true);
    expect(solutionModelNeedsExistingSystemContext("CONTINUOUS_ENGINEERING")).toBe(true);
    expect(solutionModelNeedsExistingSystemContext("NEW_PRODUCT")).toBe(false);
    expect(solutionModelNeedsExistingSystemContext("")).toBe(false);
  });
});

describe("validateStep — step 0 (direction)", () => {
  it("requires both a solution model and an engagement model", () => {
    const errors = validateStep(0, values({}));
    expect(errors.solutionModel).toBeTruthy();
    expect(errors.engagementModel).toBeTruthy();
  });

  it("passes once the guidance/recommendation escape options are chosen", () => {
    const errors = validateStep(0, values({ solutionModel: "NEEDS_GUIDANCE", engagementModel: "NEEDS_RECOMMENDATION" }));
    expect(errors.solutionModel).toBeUndefined();
    expect(errors.engagementModel).toBeUndefined();
  });
});

describe("validateStep — step 1 (situation)", () => {
  it("requires the problem statement, project stage and timeline", () => {
    const errors = validateStep(1, values({}));
    expect(errors.problemStatement).toBeTruthy();
    expect(errors.projectStage).toBeTruthy();
    expect(errors.timeline).toBeTruthy();
  });

  it("rejects a problem statement that is too short", () => {
    const errors = validateStep(1, values({ problemStatement: "too short", projectStage: "IDEA", timeline: "ASAP" }));
    expect(errors.problemStatement).toMatch(/at least/i);
  });

  it("does not require budget range or product types — both optional", () => {
    const errors = validateStep(
      1,
      values({
        problemStatement: "A full paragraph describing the real business problem we are facing today.",
        projectStage: "IDEA",
        timeline: "ASAP",
      }),
    );
    expect(errors.budgetRange).toBeUndefined();
    expect(errors.productTypes).toBeUndefined();
  });
});

describe("validateStep — step 2 (contact, country-aware phone)", () => {
  const base = {
    name: "Priya Sharma",
    email: "priya@example.com",
    country: "IN",
    phone: "9876543210",
    preferredContactMethod: "EMAIL" as const,
  };

  it("requires name, email, country and phone", () => {
    const errors = validateStep(2, values({}));
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.country).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.preferredContactMethod).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const errors = validateStep(2, values({ ...base, email: "not-an-email" }));
    expect(errors.email).toBeTruthy();
  });

  it("passes with a valid Indian national number", () => {
    const errors = validateStep(2, values(base));
    expect(errors.phone).toBeUndefined();
    expect(errors.country).toBeUndefined();
  });

  it("rejects an Indian number that is too long, with a clear country-specific message", () => {
    const errors = validateStep(2, values({ ...base, phone: "98765432109999" }));
    expect(errors.phone).toBe("Enter a valid phone number for India.");
  });

  it("rejects letters with a simple, non-technical message", () => {
    const errors = validateStep(2, values({ ...base, phone: "abc123xyz" }));
    expect(errors.phone).toBeTruthy();
    expect(errors.phone).not.toMatch(/INVALID_COUNTRY_CODE|TOO_LONG|libphonenumber|parse error/i);
  });

  it("passes with a valid Hong Kong national number", () => {
    const errors = validateStep(2, values({ ...base, country: "HK", phone: "51234567" }));
    expect(errors.phone).toBeUndefined();
  });

  it("does not require WhatsApp consent unless WhatsApp is the preferred method", () => {
    const errors = validateStep(2, values({ ...base, preferredContactMethod: "PHONE", whatsappConsent: false }));
    expect(errors.whatsappConsent).toBeUndefined();
  });

  it("requires explicit WhatsApp consent when WhatsApp is chosen", () => {
    const errors = validateStep(2, values({ ...base, preferredContactMethod: "WHATSAPP", whatsappConsent: false }));
    expect(errors.whatsappConsent).toBeTruthy();
  });

  it("passes once WhatsApp consent is given", () => {
    const errors = validateStep(2, values({ ...base, preferredContactMethod: "WHATSAPP", whatsappConsent: true }));
    expect(errors.whatsappConsent).toBeUndefined();
  });

  it("does not require company or role", () => {
    const errors = validateStep(2, values(base));
    expect(errors.company).toBeUndefined();
    expect(errors.role).toBeUndefined();
  });
});

describe("validateAll", () => {
  it("combines errors across all three steps", () => {
    const errors = validateAll(values({}));
    expect(errors.solutionModel).toBeTruthy();
    expect(errors.problemStatement).toBeTruthy();
    expect(errors.name).toBeTruthy();
  });
});
