import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ContinuousPulseVisual } from "./ContinuousPulseVisual";

describe("ContinuousPulseVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ContinuousPulseVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders the arc, four signal dots, the live/halo pair and the pulse line", () => {
    const { container } = render(<ContinuousPulseVisual />);
    expect(container.querySelectorAll("circle")).toHaveLength(6);
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });
});
