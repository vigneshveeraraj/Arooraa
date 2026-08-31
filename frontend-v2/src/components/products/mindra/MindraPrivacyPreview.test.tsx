import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MindraPrivacyPreview } from "./MindraPrivacyPreview";

describe("MindraPrivacyPreview", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<MindraPrivacyPreview />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("restates the private/shared concept without new claims", () => {
    const { container } = render(<MindraPrivacyPreview />);
    const text = container.textContent ?? "";
    expect(text).toContain("Privacy");
    expect(text).toContain("Personal notes stay private");
    expect(text).toContain("Household tasks are shared");
  });

  it("does not expose internal authorization mechanics", () => {
    const { container } = render(<MindraPrivacyPreview />);
    const text = container.textContent ?? "";
    const disallowed = [/jwt/i, /bcrypt/i, /guard/i, /refresh[- ]token/i, /database/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
