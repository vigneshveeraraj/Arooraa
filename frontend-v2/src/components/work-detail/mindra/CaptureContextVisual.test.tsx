import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaptureContextVisual } from "./CaptureContextVisual";

describe("CaptureContextVisual", () => {
  it("renders the three capture stages as real, visible text, in order", () => {
    render(<CaptureContextVisual />);
    for (const stage of ["Capture", "Organize", "Return When Useful"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("renders no connector arrows between the three zones", () => {
    const { container } = render(<CaptureContextVisual />);
    expect(container.textContent).not.toMatch(/→/);
  });

  it("shows one continuous scene with three cards per zone (nine total), icons appearing only from Organize onward", () => {
    const { container } = render(<CaptureContextVisual />);
    const scene = screen.getByTestId("capture-frame-scene");
    expect(scene.querySelectorAll("rect")).toHaveLength(9);
    // Capture has 0 icon overlays; Organize and Return each have 3 (6 total)
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(6);
  });
});
