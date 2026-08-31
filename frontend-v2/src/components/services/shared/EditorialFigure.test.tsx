import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EditorialFigure } from "./EditorialFigure";

describe("EditorialFigure", () => {
  it("renders a head (circle) and shoulders (path) with no text content", () => {
    const { container } = render(
      <svg>
        <EditorialFigure x={10} y={20} />
      </svg>,
    );
    expect(container.querySelector("circle")).toBeInTheDocument();
    expect(container.querySelector("path")).toBeInTheDocument();
    expect(container.textContent).toBe("");
  });

  it("applies the given translate/scale transform, flipping horizontally when requested", () => {
    const { container } = render(
      <svg>
        <EditorialFigure x={40} y={60} scale={0.8} flip />
      </svg>,
    );
    const group = container.querySelector("g");
    expect(group).toHaveAttribute("transform", "translate(40,60) scale(-0.8,0.8)");
  });
});
