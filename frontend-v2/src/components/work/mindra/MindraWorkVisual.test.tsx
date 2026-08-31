import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MindraWorkVisual } from "./MindraWorkVisual";

describe("MindraWorkVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<MindraWorkVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders two orbit rings, four hollow and four solid points, and one central figure", () => {
    const { container } = render(<MindraWorkVisual />);
    // 2 rings + 4 outer (solid) + 4 inner (hollow) + 1 figure head = 11
    expect(container.querySelectorAll("circle")).toHaveLength(11);
    expect(container.querySelectorAll("g")).toHaveLength(1);
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });
});
