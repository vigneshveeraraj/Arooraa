import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeEnergyInsightVisual } from "./SmartHomeEnergyInsightVisual";

describe("SmartHomeEnergyInsightVisual", () => {
  it("renders the real room-energy photograph with descriptive alt text", () => {
    render(<SmartHomeEnergyInsightVisual />);
    const image = screen.getByRole("img", {
      name: "Concept visualization of Ground Floor Bedroom monthly energy usage with device-level breakdown and local-control status.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-home/smart-home-room-energy-concept.webp");
  });

  it("labels the numbers as illustrative, not a claimed savings result", () => {
    render(<SmartHomeEnergyInsightVisual />);
    expect(screen.getByText("Illustrative Smart Home energy experience")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%\s*(saved|savings)/i);
    expect(text).not.toMatch(/guaranteed savings/i);
  });
});
