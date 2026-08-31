import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FragmentedDayVisual } from "./FragmentedDayVisual";

describe("FragmentedDayVisual", () => {
  it("renders all six fragmented-day items as real, visible text around the decorative figure", () => {
    render(<FragmentedDayVisual />);
    for (const label of ["Notes", "Tasks", "Saved Links", "Groceries", "Family Plans", "Reminders"]) {
      const item = screen.getByText(label);
      expect(item).toBeInTheDocument();
      expect(item).not.toHaveAttribute("aria-hidden");
    }
  });

  it("renders no connecting lines between the fragments (deliberately fragmented, not chaotic)", () => {
    const { container } = render(<FragmentedDayVisual />);
    expect(container.querySelectorAll("svg path[d*='Q']")).toHaveLength(0);
  });
});
