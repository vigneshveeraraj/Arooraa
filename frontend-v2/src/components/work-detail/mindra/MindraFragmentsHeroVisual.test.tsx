import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MindraFragmentsHeroVisual } from "./MindraFragmentsHeroVisual";

describe("MindraFragmentsHeroVisual", () => {
  it("renders as a fully decorative, textless scene with no fabricated metrics", () => {
    const { container } = render(<MindraFragmentsHeroVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders five scattered fragments connected to five calm, settled counterparts", () => {
    const { container } = render(<MindraFragmentsHeroVisual />);
    const backgroundScene = container.querySelector("svg")!;
    expect(backgroundScene.querySelectorAll(":scope > path")).toHaveLength(5);
    expect(backgroundScene.querySelectorAll(":scope > rect")).toHaveLength(10);
    // 10 icon overlays (5 scattered + 5 calm), each its own small svg
    expect(container.querySelectorAll("svg")).toHaveLength(11);
  });
});
