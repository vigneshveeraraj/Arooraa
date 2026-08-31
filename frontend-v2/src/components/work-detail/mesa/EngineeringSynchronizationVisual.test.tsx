import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EngineeringSynchronizationVisual } from "./EngineeringSynchronizationVisual";

describe("EngineeringSynchronizationVisual", () => {
  it("renders all five lanes as real, visible labels with one large aria-hidden diagram", () => {
    render(<EngineeringSynchronizationVisual />);
    for (const lane of ["Guest", "Table", "Service", "Kitchen", "Billing"]) {
      expect(screen.getByText(lane)).toBeInTheDocument();
    }
  });

  it("draws one big synchronized diagram — 5 lane lines, 2 vertical sync lines crossing all lanes, 10 markers, and one kitchen branch", () => {
    const { container } = render(<EngineeringSynchronizationVisual />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // 2 vertical sync lines + 5 lane lines = 7
    expect(container.querySelectorAll("line")).toHaveLength(7);
    // 5 lanes x 2 sync columns + 1 branch marker = 11
    expect(container.querySelectorAll("circle")).toHaveLength(11);
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });

  it("does not expose internal service names, APIs or data-store terminology", () => {
    render(<EngineeringSynchronizationVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/redis|kafka|postgres|api|topic/i);
  });
});
