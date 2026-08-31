import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayWithMindraStoryboard } from "./DayWithMindraStoryboard";

describe("DayWithMindraStoryboard", () => {
  it("renders six moments across the day, each with a time, label and description", () => {
    render(<DayWithMindraStoryboard />);
    for (const label of ["Today", "Capture", "Grocery", "Family Space", "Meal Plan", "Handled"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText("Morning").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Evening").length).toBeGreaterThan(0);
  });

  it("renders as one ordered list with six items (one responsive grid, not separate mobile/desktop layouts)", () => {
    const { container } = render(<DayWithMindraStoryboard />);
    const list = container.querySelector("ol")!;
    expect(list).toHaveAttribute("aria-label", "A day with Mindra");
    expect(list.querySelectorAll("li")).toHaveLength(6);
  });
});
