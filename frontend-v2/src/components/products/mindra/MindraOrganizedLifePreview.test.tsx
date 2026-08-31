import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MindraOrganizedLifePreview } from "./MindraOrganizedLifePreview";

describe("MindraOrganizedLifePreview", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<MindraOrganizedLifePreview />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows grouped, everyday categories", () => {
    const { container } = render(<MindraOrganizedLifePreview />);
    const text = container.textContent ?? "";
    for (const fragment of ["Organized", "Personal", "Family", "Groceries", "Meals"]) {
      expect(text).toContain(fragment);
    }
  });

  it("does not expose internal data-model terms", () => {
    const { container } = render(<MindraOrganizedLifePreview />);
    const text = container.textContent ?? "";
    const disallowed = [/database/i, /schema/i, /\bapi\b/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
