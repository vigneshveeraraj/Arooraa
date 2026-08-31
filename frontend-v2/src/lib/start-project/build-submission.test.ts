import { describe, expect, it } from "vitest";
import { buildSubmission } from "./build-submission";
import { EMPTY_FORM_VALUES, type StartProjectFormValues } from "./types";

const FILLED_VALUES: StartProjectFormValues = {
  ...EMPTY_FORM_VALUES,
  solutionModel: "AI_DATA_AUTOMATION",
  engagementModel: "DISCOVER_DEFINE",
  problemStatement: "  Our support team re-keys the same data across three tools every day.  ",
  projectStage: "EXPLORING",
  productTypes: ["AI_DATA", "BACKEND_APIS"],
  timeline: "WITHIN_1_TO_3_MONTHS",
  budgetRange: "FROM_5L_TO_15L",
  existingSystemContext: "  A legacy CRM plus a spreadsheet-based tracker.  ",
  name: "  Priya Sharma  ",
  email: "  priya@example.com  ",
  phone: "9876543210",
  country: "IN",
  company: "  Example Co  ",
  role: "  Product  ",
  preferredContactMethod: "WHATSAPP",
  whatsappConsent: true,
  preferredContactTime: "MORNING",
};

describe("buildSubmission", () => {
  it("trims free-text fields and produces a canonical E.164 phone value", () => {
    const payload = buildSubmission(FILLED_VALUES, {});
    expect(payload.problemStatement).toBe("Our support team re-keys the same data across three tools every day.");
    expect(payload.existingSystemContext).toBe("A legacy CRM plus a spreadsheet-based tracker.");
    expect(payload.contact.name).toBe("Priya Sharma");
    expect(payload.contact.email).toBe("priya@example.com");
    expect(payload.contact.phone).toBe("+919876543210");
    expect(payload.contact.country).toBe("India");
    expect(payload.contact.company).toBe("Example Co");
    expect(payload.contact.role).toBe("Product");
  });

  it("converts the ISO2 country code to a human-readable name for the payload", () => {
    const payload = buildSubmission({ ...FILLED_VALUES, country: "HK", phone: "51234567" }, {});
    expect(payload.contact.country).toBe("Hong Kong");
    expect(payload.contact.phone).toBe("+85251234567");
  });

  it("sends the raw ISO2 code alongside the display name", () => {
    const payload = buildSubmission(FILLED_VALUES, {});
    expect(payload.contact.countryCode).toBe("IN");
  });

  it("carries the solution/engagement selections and qualification fields through untouched", () => {
    const payload = buildSubmission(FILLED_VALUES, {});
    expect(payload.solutionModel).toBe("AI_DATA_AUTOMATION");
    expect(payload.engagementModel).toBe("DISCOVER_DEFINE");
    expect(payload.projectStage).toBe("EXPLORING");
    expect(payload.productTypes).toEqual(["AI_DATA", "BACKEND_APIS"]);
    expect(payload.timeline).toBe("WITHIN_1_TO_3_MONTHS");
    expect(payload.budgetRange).toBe("FROM_5L_TO_15L");
  });

  it("carries WhatsApp consent and preferred contact time through", () => {
    const payload = buildSubmission(FILLED_VALUES, {});
    expect(payload.contact.preferredMethod).toBe("WHATSAPP");
    expect(payload.contact.whatsappConsent).toBe(true);
    expect(payload.contact.preferredTime).toBe("MORNING");
  });

  it("omits optional fields rather than sending empty strings", () => {
    const minimal: StartProjectFormValues = {
      ...FILLED_VALUES,
      budgetRange: "",
      existingSystemContext: "",
      country: "",
      company: "",
      role: "",
      preferredContactTime: "",
    };
    const payload = buildSubmission(minimal, {});
    expect(payload.budgetRange).toBeUndefined();
    expect(payload.existingSystemContext).toBeUndefined();
    expect(payload.contact.country).toBeUndefined();
    expect(payload.contact.countryCode).toBeUndefined();
    expect(payload.contact.company).toBeUndefined();
    expect(payload.contact.role).toBeUndefined();
    expect(payload.contact.preferredTime).toBeUndefined();
  });

  it("keeps attribution structurally separate from the problem statement", () => {
    const payload = buildSubmission(FILLED_VALUES, {
      sourceContext: "AI_DATA_AUTOMATION",
      utmSource: "linkedin",
    });
    expect(payload.attribution.sourceContext).toBe("AI_DATA_AUTOMATION");
    expect(payload.attribution.utmSource).toBe("linkedin");
    expect(payload.problemStatement).not.toMatch(/linkedin|AI_DATA_AUTOMATION/);
  });
});
