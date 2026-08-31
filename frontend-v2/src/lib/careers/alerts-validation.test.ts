import { describe, expect, it } from "vitest";
import { validateTalentAlertForm } from "./alerts-validation";
import { EMPTY_TALENT_ALERT_VALUES } from "./alerts-types";

describe("validateTalentAlertForm", () => {
  it("requires a name", () => {
    const errors = validateTalentAlertForm({ ...EMPTY_TALENT_ALERT_VALUES, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("requires a valid email address", () => {
    expect(validateTalentAlertForm({ ...EMPTY_TALENT_ALERT_VALUES, name: "A", email: "" }).email).toBeDefined();
    expect(validateTalentAlertForm({ ...EMPTY_TALENT_ALERT_VALUES, name: "A", email: "not-an-email" }).email).toBeDefined();
    expect(
      validateTalentAlertForm({ ...EMPTY_TALENT_ALERT_VALUES, name: "A", email: "person@example.com" }).email,
    ).toBeUndefined();
  });

  it("requires at least one area of interest", () => {
    const errors = validateTalentAlertForm({ ...EMPTY_TALENT_ALERT_VALUES, name: "A", email: "a@b.com", areasOfInterest: [] });
    expect(errors.areasOfInterest).toBeDefined();
  });

  it("requires explicit consent", () => {
    const errors = validateTalentAlertForm({
      ...EMPTY_TALENT_ALERT_VALUES,
      name: "A",
      email: "a@b.com",
      areasOfInterest: ["AI_DATA"],
      consent: false,
    });
    expect(errors.consent).toBeDefined();
  });

  it("passes with a complete, valid submission", () => {
    const errors = validateTalentAlertForm({
      name: "A",
      email: "a@b.com",
      areasOfInterest: ["AI_DATA"],
      experienceLevel: "",
      consent: true,
    });
    expect(errors).toEqual({});
  });
});
