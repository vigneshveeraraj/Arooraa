import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiSystemVisual } from "./AiSystemVisual";

describe("AiSystemVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<AiSystemVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders scattered raw-data signals flowing through a filter into one action card with a control-ring badge", () => {
    const { container } = render(<AiSystemVisual />);
    // 6 raw-data signals + 1 control ring = 7
    expect(container.querySelectorAll("circle")).toHaveLength(7);
    // filter shape + arrowhead + checkmark = 3
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(container.querySelectorAll("line")).toHaveLength(1);
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });
});
