import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductEngineeringOrbitVisual } from "./ProductEngineeringOrbitVisual";

describe("ProductEngineeringOrbitVisual", () => {
  it("renders The Product center label and all nine concerns as real text", () => {
    render(<ProductEngineeringOrbitVisual />);
    expect(screen.getByText("The Product")).toBeInTheDocument();
    for (const concern of [
      "Business purpose",
      "User need",
      "Provider reality",
      "UX",
      "Architecture",
      "Engineering",
      "Quality",
      "Security",
      "Operations",
    ]) {
      expect(screen.getByText(concern)).toBeInTheDocument();
    }
  });
});
