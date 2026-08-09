import { describe, expect, it } from "vitest";
import { isValidIndianMobile, validateDemoRequestForm } from "./validation";
import { EMPTY_FORM_VALUES, type DemoRequestFormValues } from "./types";

describe("isValidIndianMobile", () => {
  it.each(["9876543210", "919876543210", "+919876543210", "+91 98765 43210", "98765-43210"])(
    "accepts %s",
    (value) => {
      expect(isValidIndianMobile(value)).toBe(true);
    },
  );

  it.each(["12345", "5876543210", "abcdefghij", "+1 9876543210", ""])("rejects %s", (value) => {
    expect(isValidIndianMobile(value)).toBe(false);
  });
});

function validValues(overrides: Partial<DemoRequestFormValues> = {}): DemoRequestFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    fullName: "Priya Sharma",
    whatsappNumber: "9876543210",
    businessEmail: "priya@spiceroute.example",
    restaurantName: "Spice Route",
    city: "Chennai",
    outletCount: "ONE",
    interestedProduct: "digital-menu-ordering",
    preferredContactMethod: "whatsapp",
    ...overrides,
  };
}

describe("validateDemoRequestForm", () => {
  it("returns no errors for a fully valid form", () => {
    expect(validateDemoRequestForm(validValues())).toEqual({});
  });

  it("flags every required field when empty", () => {
    const errors = validateDemoRequestForm(EMPTY_FORM_VALUES);
    expect(Object.keys(errors).sort()).toEqual(
      [
        "fullName",
        "whatsappNumber",
        "businessEmail",
        "restaurantName",
        "city",
        "outletCount",
        "interestedProduct",
        "preferredContactMethod",
      ].sort(),
    );
  });

  it("does not require the optional message field", () => {
    const errors = validateDemoRequestForm(validValues({ message: "" }));
    expect(errors.message).toBeUndefined();
  });

  it("rejects an invalid phone number", () => {
    const errors = validateDemoRequestForm(validValues({ whatsappNumber: "12345" }));
    expect(errors.whatsappNumber).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const errors = validateDemoRequestForm(validValues({ businessEmail: "not-an-email" }));
    expect(errors.businessEmail).toBeDefined();
  });
});
