import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PlatformFlowVisual } from "./PlatformFlowVisual";

describe("PlatformFlowVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<PlatformFlowVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders seven stages, six forward arrows and one feedback path with its arrowhead", () => {
    const { container } = render(<PlatformFlowVisual />);
    // 7 stages + 1 operator's screen prop
    expect(container.querySelectorAll("rect")).toHaveLength(8);
    // 6 forward arrowheads + 1 feedback curve + 1 feedback arrowhead + 1 figure torso = 9
    expect(container.querySelectorAll("path")).toHaveLength(9);
  });

  it("S8: renders the editorial operator figure watching the flow", () => {
    const { container } = render(<PlatformFlowVisual />);
    expect(container.querySelector("g")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
  });
});
