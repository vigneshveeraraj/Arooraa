import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvolutionLoopVisual } from "./EvolutionLoopVisual";

describe("EvolutionLoopVisual", () => {
  it("renders all six evolution steps as real, visible labels around the loop", () => {
    render(<EvolutionLoopVisual />);
    for (const step of ["Idea", "Build", "Test", "Observe", "Correct", "Expand"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });
});
