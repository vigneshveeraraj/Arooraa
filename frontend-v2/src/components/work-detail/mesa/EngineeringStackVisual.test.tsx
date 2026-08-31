import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringStackVisual } from "./EngineeringStackVisual";

describe("EngineeringStackVisual", () => {
  it("renders all eight stack layers as real text, converging on one labeled point", () => {
    render(<EngineeringStackVisual />);
    for (const layer of [
      "Experience",
      "Product Workflows",
      "Web / Mobile",
      "Backend",
      "Data",
      "Real-Time",
      "Quality",
      "Cloud / Operations",
    ]) {
      expect(screen.getByText(layer)).toBeInTheDocument();
    }
    expect(screen.getByText("One Restaurant Experience")).toBeInTheDocument();
  });
});
