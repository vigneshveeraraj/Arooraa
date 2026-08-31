import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartHomeWorkVisual } from "./SmartHomeWorkVisual";

describe("SmartHomeWorkVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<SmartHomeWorkVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders a divided house with room systems, a physical switch and a local controller linked by short paths", () => {
    const { container } = render(<SmartHomeWorkVisual />);
    // roof + 3 room-link paths = 4
    expect(container.querySelectorAll("path")).toHaveLength(4);
    // houseBody + switchPlate + energyNode + waterTank + controller = 5
    expect(container.querySelectorAll("rect")).toHaveLength(5);
    // 2 room dividers + water level = 3
    expect(container.querySelectorAll("line")).toHaveLength(3);
    // lightRing + lightCore + switchToggle + energyDot = 4
    expect(container.querySelectorAll("circle")).toHaveLength(4);
  });
});
