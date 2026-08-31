import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodayBentoVisual } from "./TodayBentoVisual";

describe("TodayBentoVisual", () => {
  it("renders all six bento areas with their label and description", () => {
    render(<TodayBentoVisual />);
    for (const label of ["Today", "Tasks", "Grocery", "Meal Plan", "Notes", "Family"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("What needs attention, right now.")).toBeInTheDocument();
  });

  it("contains no percentages or numeric analytics", () => {
    const { container } = render(<TodayBentoVisual />);
    expect(container.textContent).not.toMatch(/\d+%/);
    expect(container.textContent).not.toMatch(/\d+\s*(tasks|items|updates)/i);
  });
});
