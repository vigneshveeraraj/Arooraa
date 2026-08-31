import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProductCollaborationVisual } from "./ProductCollaborationVisual";

describe("ProductCollaborationVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<ProductCollaborationVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders both clusters and the connecting node", () => {
    const { container } = render(<ProductCollaborationVisual />);
    expect(container.querySelectorAll("circle")).toHaveLength(4);
    expect(container.querySelectorAll("rect")).toHaveLength(3);
  });
});
