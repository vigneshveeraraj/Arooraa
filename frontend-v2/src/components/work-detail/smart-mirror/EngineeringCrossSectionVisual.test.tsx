import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringCrossSectionVisual } from "./EngineeringCrossSectionVisual";

describe("EngineeringCrossSectionVisual", () => {
  it("renders the four public engineering layers as real text", () => {
    render(<EngineeringCrossSectionVisual />);
    for (const layer of ["Experience", "Display", "Edge", "Physical Product"]) {
      expect(screen.getByText(layer)).toBeInTheDocument();
    }
  });

  it("renders the public engineering considerations as real text", () => {
    render(<EngineeringCrossSectionVisual />);
    for (const item of ["Startup and recovery", "Display behavior", "Local state", "Maintainability"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("reveals no implementation internals", () => {
    render(<EngineeringCrossSectionVisual />);
    const text = (document.body.textContent ?? "").toLowerCase();
    for (const term of ["database", "api key", "repository", "kafka", "redis"]) {
      expect(text).not.toContain(term);
    }
  });
});
