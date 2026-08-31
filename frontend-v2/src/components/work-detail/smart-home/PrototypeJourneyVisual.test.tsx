import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrototypeJourneyVisual } from "./PrototypeJourneyVisual";

describe("PrototypeJourneyVisual", () => {
  it("renders all seven journey stages as real text, in one ordered list", () => {
    const { container } = render(<PrototypeJourneyVisual />);
    const list = container.querySelector("ol")!;
    expect(list.querySelectorAll("li")).toHaveLength(7);
    for (const stage of [
      "Understand the home",
      "Prove local reliability",
      "Make energy visible",
      "Add manual-compatible automation",
      "Expand carefully",
      "Introduce broader household awareness",
      "Explore intelligence only where useful",
    ]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("is not a Gantt chart — no date ranges or percentage-complete bars", () => {
    render(<PrototypeJourneyVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%/);
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
  });
});
