import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrototypeVsFutureVisual } from "./PrototypeVsFutureVisual";

// W2.3A: below ~768px the radial diagram gives way to a separate, simpler
// stacked mobile layout instead of shrinking chips until they collide, so
// every current/future item now renders twice in the DOM (once per
// layout) — only one copy is ever visually exposed at a given viewport
// (the other is `display: none`, which is correctly excluded from the
// accessibility tree in real browsers), but jsdom doesn't evaluate media
// queries, so tests assert on both copies via getAllByText.
describe("PrototypeVsFutureVisual", () => {
  it("labels the current prototype core and the future directions distinctly, in both layouts", () => {
    render(<PrototypeVsFutureVisual />);
    expect(screen.getAllByText("Prototype Foundation / Current Exploration")).toHaveLength(2);
    expect(screen.getAllByText("Future Application Directions")).toHaveLength(2);
  });

  it("renders all five current-prototype items and nine future-direction items as real text, in both layouts", () => {
    render(<PrototypeVsFutureVisual />);
    for (const item of ["Physical Smart Mirror concept", "Reflective surface + display approach", "Raspberry Pi 5 prototype foundation", "Ambient UI experimentation", "Morning / contextual experience exploration"]) {
      expect(screen.getAllByText(item)).toHaveLength(2);
    }
    for (const item of [
      "Richer contextual assistance",
      "Home / family context",
      "Natural interaction",
      "Fitness experiences",
      "Salon / styling experiences",
      "Hospitality experiences",
      "Deeper local intelligence",
      "Appropriate smart-home integrations",
      "More adaptive ambient experiences",
    ]) {
      expect(screen.getAllByText(item)).toHaveLength(2);
    }
  });

  it("keeps gym/salon/hospitality/fitness experiences explicitly in the future column, never the current one, in both layouts", () => {
    render(<PrototypeVsFutureVisual />);
    const cores = screen.getAllByText("Prototype Foundation / Current Exploration").map((el) => el.parentElement!);
    for (const core of cores) {
      expect(core.textContent).not.toMatch(/Fitness experiences|Salon \/ styling experiences|Hospitality experiences/);
    }
  });

  it("provides a genuinely different mobile layout (not just a shrunk radial diagram)", () => {
    const { container } = render(<PrototypeVsFutureVisual />);
    expect(container.querySelector('[class*="mobileFutureList"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="desktopLayout"]')).toBeInTheDocument();
  });
});
