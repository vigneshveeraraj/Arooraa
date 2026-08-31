import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProductTeamAssemblyVisual } from "./ProductTeamAssemblyVisual";

describe("ProductTeamAssemblyVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ProductTeamAssemblyVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders a central product surface with docked and arriving component chips, and two figures", () => {
    const { container } = render(<ProductTeamAssemblyVisual />);
    // 3 motion echoes + product + surfaceAccent + 2 docked + 3 arriving = 10
    expect(container.querySelectorAll("rect")).toHaveLength(10);
    expect(container.querySelectorAll("g")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(2);
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });
});
