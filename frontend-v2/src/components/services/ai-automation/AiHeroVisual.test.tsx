import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiHeroVisual } from "./AiHeroVisual";

describe("AiHeroVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<AiHeroVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("S8.2: renders the adaptive intelligence form, drifting raw-information fragments, a resolved output panel and one editorial figure", () => {
    const { container } = render(<AiHeroVisual />);
    // formShadow + formOuter + formInner + 6 fragments + output = 10
    expect(container.querySelectorAll("rect")).toHaveLength(10);
    // 2 pattern arcs + checkmark + figure torso = 4
    expect(container.querySelectorAll("path")).toHaveLength(4);
    // 3 trail dots + figure head = 4
    expect(container.querySelectorAll("circle")).toHaveLength(4);
    expect(container.querySelectorAll("g")).toHaveLength(1);
  });
});
