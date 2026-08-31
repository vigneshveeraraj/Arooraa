import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaJourneyBand } from "./MesaJourneyBand";

describe("MesaJourneyBand", () => {
  it("renders the four journey labels as real, visible text in a staggered list — not feature cards", () => {
    render(<MesaJourneyBand />);
    for (const label of ["Guest", "Operations", "Kitchen", "Billing"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("list")).toBeInTheDocument();
    // three decorative arrows between the four steps
    expect(screen.getAllByText("→")).toHaveLength(3);
  });

  it("gives each step an increasing stagger index for the staircase effect", () => {
    const { container } = render(<MesaJourneyBand />);
    const steps = container.querySelectorAll("li");
    expect(steps).toHaveLength(4);
    steps.forEach((step, index) => {
      expect(step.style.getPropertyValue("--step-index")).toBe(String(index));
    });
  });
});
