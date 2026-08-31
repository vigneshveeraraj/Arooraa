import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProductHealthVisual } from "./ProductHealthVisual";

describe("ProductHealthVisual", () => {
  it("renders an aria-hidden svg with no text content and no invented metrics", () => {
    const { container } = render(<ProductHealthVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders six ascending steps with a rising trend line continuing past the last step", () => {
    const { container } = render(<ProductHealthVisual />);
    expect(container.querySelectorAll("rect")).toHaveLength(6);
    // rising trend line + dashed continuation = 2
    expect(container.querySelectorAll("path")).toHaveLength(2);
    // 6 step markers + 1 open end = 7
    expect(container.querySelectorAll("circle")).toHaveLength(7);
  });
});
