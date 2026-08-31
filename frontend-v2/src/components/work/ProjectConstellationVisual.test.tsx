import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProjectConstellationVisual } from "./ProjectConstellationVisual";

describe("ProjectConstellationVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ProjectConstellationVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders four richer, larger product objects connected to one shared, subtle origin point", () => {
    const { container } = render(<ProjectConstellationVisual />);
    // mesaShadow + table + mirrorShadow + houseShadow = 4
    expect(container.querySelectorAll("ellipse")).toHaveLength(4);
    // mirrorBody + mirrorStand + houseBody + houseDoor + houseWindow = 5
    expect(container.querySelectorAll("rect")).toHaveLength(5);
    expect(container.querySelectorAll("line")).toHaveLength(1);
    // 2 chairs + mirror highlight + roof + 4 connectors = 8
    expect(container.querySelectorAll("path")).toHaveLength(8);
    // 2 plates + origin + outerRing + innerRing + centerDot + 4 outerDots + 2 innerDots + houseNode = 13
    expect(container.querySelectorAll("circle")).toHaveLength(13);
  });
});
