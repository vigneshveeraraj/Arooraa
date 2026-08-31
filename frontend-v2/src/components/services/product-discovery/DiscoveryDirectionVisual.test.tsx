import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DiscoveryDirectionVisual } from "./DiscoveryDirectionVisual";

describe("DiscoveryDirectionVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<DiscoveryDirectionVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders four dead-end branches, one chosen path to a destination marker, and one figure", () => {
    const { container } = render(<DiscoveryDirectionVisual />);
    // 4 branch paths + 1 chosen path + 1 pennant + 1 figure torso = 7
    expect(container.querySelectorAll("path")).toHaveLength(7);
    // 4 dead ends + 1 origin + 1 marker base + 1 figure head = 7
    expect(container.querySelectorAll("circle")).toHaveLength(7);
    expect(container.querySelectorAll("line")).toHaveLength(1);
    expect(container.querySelectorAll("g")).toHaveLength(1);
  });
});
