import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhysicalProductVisual } from "./PhysicalProductVisual";

describe("PhysicalProductVisual", () => {
  it("renders the exploded engineering image exactly once, large, with a public-safe alt description", () => {
    render(<PhysicalProductVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-mirror/story/exploded-engineering.webp");
    expect(img).toHaveAttribute("width", "1400");
  });

  it("renders the five public-safe physical layers as real text", () => {
    render(<PhysicalProductVisual />);
    for (const layer of ["Reflective acrylic / two-way surface", "Digital display", "Raspberry Pi 5 prototype edge platform", "Slim frame", "Rear mounting system"]) {
      expect(screen.getByText(layer)).toBeInTheDocument();
    }
  });

  it("never mentions wiring, pinouts, BOM, cost or component identifiers", () => {
    render(<PhysicalProductVisual />);
    const text = (document.body.textContent ?? "").toLowerCase();
    for (const term of ["wiring", "pinout", "bill of materials", "bom", "manufacturing cost", "gpio"]) {
      expect(text).not.toContain(term);
    }
  });
});
