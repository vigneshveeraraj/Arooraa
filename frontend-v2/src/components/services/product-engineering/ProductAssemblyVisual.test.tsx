import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProductAssemblyVisual } from "./ProductAssemblyVisual";

describe("ProductAssemblyVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ProductAssemblyVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders eight converging layer bars and one final product block", () => {
    const { container } = render(<ProductAssemblyVisual />);
    expect(container.querySelectorAll("rect")).toHaveLength(9);
    expect(container.querySelectorAll("line")).toHaveLength(8);
  });
});
