import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorWorkVisual } from "./SmartMirrorWorkVisual";

describe("SmartMirrorWorkVisual", () => {
  it("renders the decorative mirror shape as aria-hidden", () => {
    const { container } = render(<SmartMirrorWorkVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders all five contextual callouts and the engineering-fragment tags as real, visible text", () => {
    render(<SmartMirrorWorkVisual />);
    for (const label of ["Morning", "Family", "Home", "Day context", "Information"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const fragment of ["Reflective Surface", "Display", "Edge Computing"]) {
      expect(screen.getByText(fragment)).toBeInTheDocument();
    }
  });
});
