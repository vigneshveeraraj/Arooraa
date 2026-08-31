import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnergyVisibilityVisual } from "./EnergyVisibilityVisual";

describe("EnergyVisibilityVisual", () => {
  it("labels the chapter as an energy experience concept", () => {
    render(<EnergyVisibilityVisual />);
    expect(screen.getByText("Energy experience concept")).toBeInTheDocument();
  });

  it("renders the energy-visibility image exactly once with concept-oriented alt text", () => {
    render(<EnergyVisibilityVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-home/story/energy-visibility.webp");
    expect(img.getAttribute("alt")).toMatch(/concept illustration/i);
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("renders the four energy-visibility story items as real text", () => {
    render(<EnergyVisibilityVisual />);
    for (const item of ["Which room is consuming more", "Which major loads are active", "How usage changes over time", "Where attention may be useful"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
