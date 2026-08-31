import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiInnovationVisual } from "./AiInnovationVisual";

describe("AiInnovationVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<AiInnovationVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders all five progression blocks", () => {
    const { container } = render(<AiInnovationVisual />);
    expect(container.querySelectorAll("rect")).toHaveLength(5);
  });
});
