import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RetrofitVisual } from "./RetrofitVisual";

describe("RetrofitVisual", () => {
  it("renders the three retrofit stages as real text", () => {
    render(<RetrofitVisual />);
    for (const stage of ["Existing Home", "Selected Upgrade Areas", "Smart Layer Added Carefully"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("renders the retrofit considerations as real text", () => {
    render(<RetrofitVisual />);
    for (const item of ["Existing electrical infrastructure", "Room differences", "Staged upgrades"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("never mentions demolition or reconstruction", () => {
    render(<RetrofitVisual />);
    const text = (document.body.textContent ?? "").toLowerCase();
    expect(text).not.toContain("demolition");
    expect(text).not.toContain("reconstruction");
  });
});
