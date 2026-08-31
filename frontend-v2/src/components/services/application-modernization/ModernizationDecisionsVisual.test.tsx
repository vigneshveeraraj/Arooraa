import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModernizationDecisionsVisual } from "./ModernizationDecisionsVisual";

describe("ModernizationDecisionsVisual", () => {
  it("shows the visible caption as real, non-hidden text", () => {
    render(<ModernizationDecisionsVisual />);
    expect(screen.getByText("Possible modernization decisions")).toBeInTheDocument();
  });

  it("keeps the six-item pill set out of the accessibility tree, unordered (no implied sequence)", () => {
    const { container } = render(<ModernizationDecisionsVisual />);
    const list = container.querySelector("ul");
    expect(list).toHaveAttribute("aria-hidden", "true");
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(6);
    expect(Array.from(items).map((el) => el.textContent)).toEqual([
      "Keep",
      "Stabilize",
      "Expose",
      "Refactor",
      "Extract",
      "Replace",
    ]);
  });
});
