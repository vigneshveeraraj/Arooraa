import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraHeroVisual } from "./MindraHeroVisual";

describe("MindraHeroVisual", () => {
  it("renders the scattered chips and the Today card", () => {
    render(<MindraHeroVisual />);
    for (const chip of ["Memory", "Task", "Grocery", "Meal Plan", "Family"]) {
      expect(screen.getByText(chip)).toBeInTheDocument();
    }
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("does not present itself as a real app screenshot", () => {
    render(<MindraHeroVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/battery/i);
    expect(text).not.toMatch(/9:41/);
    expect(text).not.toMatch(/signal/i);
  });
});
