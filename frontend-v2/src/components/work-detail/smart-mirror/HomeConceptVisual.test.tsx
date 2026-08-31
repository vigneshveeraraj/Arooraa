import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeConceptVisual } from "./HomeConceptVisual";

describe("HomeConceptVisual", () => {
  it("labels the chapter as a home experience concept", () => {
    render(<HomeConceptVisual />);
    expect(screen.getByText("Home experience concept")).toBeInTheDocument();
  });

  it("renders the three-moment morning sequence as real, visible text, in order", () => {
    const { container } = render(<HomeConceptVisual />);
    const list = container.querySelector("ol")!;
    const items = Array.from(list.querySelectorAll("li")).map((li) => li.textContent);
    expect(items[0]).toContain("Start");
    expect(items[1]).toContain("Prepare");
    expect(items[2]).toContain("Leave");
  });

  it("renders all six home experience-concept items as real, visible text", () => {
    render(<HomeConceptVisual />);
    for (const item of ["Time & day context", "Reminders", "Calendar", "Family & home context", "Simple wellness context", "Information relevant before leaving"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("does not render a raster image (the one home scene is used in the hero)", () => {
    render(<HomeConceptVisual />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
