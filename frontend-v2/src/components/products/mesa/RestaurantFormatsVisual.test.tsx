import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RestaurantFormatsVisual } from "./RestaurantFormatsVisual";

describe("RestaurantFormatsVisual", () => {
  it("frames formats as relevance, not proof of deployment", () => {
    render(<RestaurantFormatsVisual />);
    expect(screen.getByText("Designed for")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/deployed at/i);
    expect(text).not.toMatch(/live at/i);
    expect(text).not.toMatch(/\d+\+? restaurants/i);
  });

  it("lists all six formats as real, accessible text", () => {
    render(<RestaurantFormatsVisual />);
    for (const format of ["Restaurant", "Café", "Bakery", "Bar / Lounge", "Hotel / Resort", "Multi-outlet food business"]) {
      expect(screen.getByText(format)).toBeInTheDocument();
    }
  });

  it("keeps every format icon decorative", () => {
    const { container } = render(<RestaurantFormatsVisual />);
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(6);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });
});
