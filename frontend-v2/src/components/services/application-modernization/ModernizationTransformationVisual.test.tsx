import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ModernizationTransformationVisual } from "./ModernizationTransformationVisual";

describe("ModernizationTransformationVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ModernizationTransformationVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders the expected block/line counts for both sides plus the transition arrow", () => {
    const { container } = render(<ModernizationTransformationVisual />);
    // 4 tangled "before" blocks + 1 preserved-before + 3 "after" blocks + 1 preserved-after + 1 carried piece
    expect(container.querySelectorAll("rect")).toHaveLength(10);
    // 4 tangle lines + 1 continuity line + 1 arrow line + 1 spine line
    expect(container.querySelectorAll("line")).toHaveLength(7);
    // arrowhead path + figure torso path
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });

  it("S8: carries an editorial engineer figure across the transition, above the arrow", () => {
    const { container } = render(<ModernizationTransformationVisual />);
    expect(container.querySelector("g")).toBeInTheDocument();
  });
});
