import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringRangeVisual } from "./EngineeringRangeVisual";

describe("EngineeringRangeVisual", () => {
  it("renders all four product names as real, visible text with no invented numbers", () => {
    render(<EngineeringRangeVisual />);
    for (const name of ["Mindra", "MESA", "Smart Mirror", "Smart Home"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("Software")).toBeInTheDocument();
    expect(screen.getByText("Physical")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%/);
  });

  it("hides only the decorative track/marker geometry from assistive tech", () => {
    const { container } = render(<EngineeringRangeVisual />);
    const tracks = container.querySelectorAll("[aria-hidden='true']");
    expect(tracks.length).toBeGreaterThan(0);
    expect(screen.getByText("MESA")).not.toHaveAttribute("aria-hidden");
  });
});
