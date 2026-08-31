import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WholeHomeVisual } from "./WholeHomeVisual";

describe("WholeHomeVisual", () => {
  it("labels the chapter as a whole-home concept visualization", () => {
    render(<WholeHomeVisual />);
    expect(screen.getByText("Whole-home concept visualization")).toBeInTheDocument();
  });

  it("renders the whole-home image exactly once", () => {
    render(<WholeHomeVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-home/story/whole-home.webp");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders the eight story threads as real text", () => {
    render(<WholeHomeVisual />);
    for (const thread of ["Room awareness", "Energy", "Comfort", "Lighting", "Resources", "Maintenance", "Local reliability", "Gradual coordination"]) {
      expect(screen.getByText(thread)).toBeInTheDocument();
    }
  });
});
