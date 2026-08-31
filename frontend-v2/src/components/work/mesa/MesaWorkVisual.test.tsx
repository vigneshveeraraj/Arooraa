import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MesaWorkVisual } from "./MesaWorkVisual";

describe("MesaWorkVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<MesaWorkVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("renders the hero table, a background second table, guest and waiter figures, the kitchen pass and the billing counter", () => {
    const { container } = render(<MesaWorkVisual />);
    // bgTable + tableShadow + table = 3
    expect(container.querySelectorAll("ellipse")).toHaveLength(3);
    // bgTableLeg + tableLeg + 2 motion ticks + 2 receipt lines = 6
    expect(container.querySelectorAll("line")).toHaveLength(6);
    // menuCard + tray + kitchenPass + counter + screen + receipt = 6
    expect(container.querySelectorAll("rect")).toHaveLength(6);
    // 2 plates + 4 order dots + readyPlate + 2 figure heads = 9
    expect(container.querySelectorAll("circle")).toHaveLength(9);
    // 2 figure torsos = 2
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelectorAll("g")).toHaveLength(2);
  });
});
