import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProofCapabilitiesVisual } from "./ProofCapabilitiesVisual";

describe("ProofCapabilitiesVisual", () => {
  it("renders all ten capability terms and the closing conclusion statement", () => {
    render(<ProofCapabilitiesVisual />);
    for (const term of [
      "Product Strategy",
      "Workflow Design",
      "Multi-Role UX",
      "Backend Engineering",
      "Real-Time Behavior",
      "Quality Engineering",
      "Security Boundaries",
      "Platform Thinking",
      "Production Operations",
      "Product Evolution",
    ]) {
      expect(screen.getByText(term)).toBeInTheDocument();
    }
    expect(
      screen.getByText(
        "MESA is not simply a restaurant product in our portfolio. It is one of the places where AROORAA continuously exercises the product-engineering discipline we offer to others.",
      ),
    ).toBeInTheDocument();
  });
});
