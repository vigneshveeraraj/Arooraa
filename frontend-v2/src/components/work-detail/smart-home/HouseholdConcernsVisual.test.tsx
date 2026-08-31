import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HouseholdConcernsVisual } from "./HouseholdConcernsVisual";

describe("HouseholdConcernsVisual", () => {
  it("renders all eight household concerns as real, visible text", () => {
    render(<HouseholdConcernsVisual />);
    for (const label of ["Lights", "AC", "Energy", "Water", "Maintenance", "Safety", "Routines", "Rooms"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("converges on one coordinated home view, not a radial hub", () => {
    render(<HouseholdConcernsVisual />);
    expect(screen.getByText(/one coordinated/i)).toBeInTheDocument();
    expect(screen.queryByText(/ecosystem/i)).not.toBeInTheDocument();
  });
});
