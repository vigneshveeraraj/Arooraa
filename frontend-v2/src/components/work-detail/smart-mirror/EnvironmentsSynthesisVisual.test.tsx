import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnvironmentsSynthesisVisual } from "./EnvironmentsSynthesisVisual";

describe("EnvironmentsSynthesisVisual", () => {
  it("renders all four environments as real, visible text", () => {
    render(<EnvironmentsSynthesisVisual />);
    for (const name of ["Home", "Fitness", "Salon", "Hospitality"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("is not a radial/hub-and-spoke diagram — no central circle or ecosystem label", () => {
    render(<EnvironmentsSynthesisVisual />);
    expect(screen.queryByText(/ecosystem/i)).not.toBeInTheDocument();
  });

  it("renders one subtle context cue per environment as real text", () => {
    render(<EnvironmentsSynthesisVisual />);
    for (const cue of ["Morning routine", "Workout companion", "Style preview", "Guest welcome"]) {
      expect(screen.getByText(cue)).toBeInTheDocument();
    }
  });
});
