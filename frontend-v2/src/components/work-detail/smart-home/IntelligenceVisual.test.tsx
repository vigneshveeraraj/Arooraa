import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntelligenceVisual } from "./IntelligenceVisual";

describe("IntelligenceVisual", () => {
  it("renders the three-stage flow as real text, in order", () => {
    const { container } = render(<IntelligenceVisual />);
    const text = container.textContent ?? "";
    const reliableIndex = text.indexOf("Reliable Home");
    const observationsIndex = text.indexOf("Observations");
    const suggestionsIndex = text.indexOf("Suggestions");
    expect(reliableIndex).toBeGreaterThan(-1);
    expect(observationsIndex).toBeGreaterThan(reliableIndex);
    expect(suggestionsIndex).toBeGreaterThan(observationsIndex);
  });

  it("states that AI should never replace deterministic safety or manual control", () => {
    render(<IntelligenceVisual />);
    expect(screen.getByText("AI should never replace deterministic safety, manual control or clearly defined electrical behaviour.")).toBeInTheDocument();
  });

  it("keeps the human as the final decision point, and avoids brain iconography", () => {
    render(<IntelligenceVisual />);
    expect(screen.getByText("The human remains the final decision point.")).toBeInTheDocument();
    expect((document.body.textContent ?? "").toLowerCase()).not.toContain("brain");
  });
});
