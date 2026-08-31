import { describe, expect, it } from "vitest";
import { formatNationalForDisplay, processPhoneInput } from "./phone-input";

describe("processPhoneInput", () => {
  it("keeps plain digits as the national number when a country is selected", () => {
    expect(processPhoneInput("9876543210", "IN")).toEqual({ nationalDigits: "9876543210" });
  });

  it("strips alphabetic characters entirely", () => {
    expect(processPhoneInput("abc123xyz", "IN")).toEqual({ nationalDigits: "123" });
  });

  it("rejects a pure-letters value down to an empty national number", () => {
    expect(processPhoneInput("abcdef", "IN")).toEqual({ nationalDigits: "" });
  });

  it("caps absurdly long digit runs rather than accepting them unbounded", () => {
    const result = processPhoneInput("888888888888888888888888", "IN");
    expect(result.nationalDigits.length).toBeLessThanOrEqual(15);
  });

  it("normalizes a pasted +91 number without duplicating the prefix", () => {
    const result = processPhoneInput("+919876543210", "IN");
    expect(result.nationalDigits).toBe("9876543210");
    expect(result.nationalDigits.startsWith("91")).toBe(false);
  });

  it("normalizes a pasted number that includes the calling code but no +", () => {
    const result = processPhoneInput("919876543210", "IN");
    expect(result.nationalDigits).toBe("9876543210");
  });

  it("detects a different country from a +-prefixed paste and reports it back", () => {
    const result = processPhoneInput("+14155550132", "IN");
    expect(result.detectedCountry).toBe("US");
    expect(result.nationalDigits).toBe("4155550132");
  });

  it("does not misinterpret a plain national number as belonging to another country", () => {
    // A US-shaped number typed while India is selected should stay attributed
    // to India (no leading '+', so there is no signal to switch countries).
    const result = processPhoneInput("4155550132", "IN");
    expect(result.detectedCountry).toBeUndefined();
    expect(result.nationalDigits).toBe("4155550132");
  });

  it("does not eat digits while a NANP number is only partially typed", () => {
    for (const partial of ["1", "14", "141", "1415", "14155", "141555", "1415555"]) {
      const result = processPhoneInput(partial, "US");
      expect(result.nationalDigits).toBe(partial);
    }
  });

  it("resolves the leading NANP '1' only once the full sequence is present", () => {
    const result = processPhoneInput("14155550132", "US");
    expect(result.nationalDigits).toBe("4155550132");
  });

  it("returns an empty national number when nothing has been typed yet", () => {
    expect(processPhoneInput("", "IN")).toEqual({ nationalDigits: "" });
  });

  it("keeps raw digits when no country is selected yet and there is no + to infer one", () => {
    expect(processPhoneInput("9876543210", "")).toEqual({ nationalDigits: "9876543210" });
  });

  it("detects a country from a +-prefixed paste even with no country selected yet", () => {
    const result = processPhoneInput("+852 5123 4567", "");
    expect(result.detectedCountry).toBe("HK");
    expect(result.nationalDigits).toBe("51234567");
  });
});

describe("formatNationalForDisplay", () => {
  it("formats an Indian national number with a visible grouping", () => {
    expect(formatNationalForDisplay("9876543210", "IN")).toBe("98765 43210");
  });

  it("returns the raw digits when no country is selected", () => {
    expect(formatNationalForDisplay("9876543210", "")).toBe("9876543210");
  });
});
