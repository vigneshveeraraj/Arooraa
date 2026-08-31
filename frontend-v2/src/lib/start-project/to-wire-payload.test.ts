import { describe, expect, it } from "vitest";
import { buildSubmission } from "./build-submission";
import { toWirePayload } from "./to-wire-payload";
import { EMPTY_FORM_VALUES, type StartProjectFormValues } from "./types";

const FILLED_VALUES: StartProjectFormValues = {
  ...EMPTY_FORM_VALUES,
  solutionModel: "AI_DATA_AUTOMATION",
  engagementModel: "DISCOVER_DEFINE",
  problemStatement: "Our support team re-keys the same data across three tools every day.",
  projectStage: "EXPLORING",
  productTypes: ["AI_DATA", "BACKEND_APIS"],
  timeline: "WITHIN_1_TO_3_MONTHS",
  budgetRange: "FROM_5L_TO_15L",
  existingSystemContext: "A legacy CRM plus a spreadsheet-based tracker.",
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "9876543210",
  country: "IN",
  company: "Example Co",
  role: "Product",
  preferredContactMethod: "WHATSAPP",
  whatsappConsent: true,
  preferredContactTime: "MORNING",
};

describe("toWirePayload", () => {
  it("marks every submission as GUIDED", () => {
    const wire = toWirePayload(buildSubmission(FILLED_VALUES, {}));
    expect(wire.submissionVersion).toBe("GUIDED");
  });

  it("maps contact fields onto the backend's flat names", () => {
    const wire = toWirePayload(buildSubmission(FILLED_VALUES, {}));
    expect(wire.name).toBe("Priya Sharma");
    expect(wire.businessEmail).toBe("priya@example.com");
    expect(wire.phone).toBe("+919876543210");
    expect(wire.country).toBe("India");
    expect(wire.countryCode).toBe("IN");
    expect(wire.companyName).toBe("Example Co");
    expect(wire.role).toBe("Product");
    expect(wire.preferredContactMethod).toBe("WHATSAPP");
    expect(wire.preferredContactTime).toBe("MORNING");
    expect(wire.whatsappConsent).toBe(true);
  });

  it("renames timeline/budgetRange to guidedTimeline/guidedBudgetRange so they never collide with the legacy contract's fields", () => {
    const wire = toWirePayload(buildSubmission(FILLED_VALUES, {}));
    expect(wire.guidedTimeline).toBe("WITHIN_1_TO_3_MONTHS");
    expect(wire.guidedBudgetRange).toBe("FROM_5L_TO_15L");
    expect(wire).not.toHaveProperty("timeline");
    expect(wire).not.toHaveProperty("budgetRange");
  });

  it("carries attribution through under the backend's exact field names", () => {
    const wire = toWirePayload(
      buildSubmission(FILLED_VALUES, {
        sourceContext: "AI_DATA_AUTOMATION",
        entryRoute: "/services/ai-automation",
        utmSource: "linkedin",
        utmContent: "hero-cta",
      }),
    );
    expect(wire.sourceContext).toBe("AI_DATA_AUTOMATION");
    expect(wire.entryRoute).toBe("/services/ai-automation");
    expect(wire.utmSource).toBe("linkedin");
    expect(wire.utmContent).toBe("hero-cta");
    expect(wire.source).toBe("WEBSITE");
  });

  it("always sends an empty honeypot value", () => {
    const wire = toWirePayload(buildSubmission(FILLED_VALUES, {}));
    expect(wire.website).toBe("");
  });
});
