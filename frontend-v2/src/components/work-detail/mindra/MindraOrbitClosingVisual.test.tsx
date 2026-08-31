import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraOrbitClosingVisual } from "./MindraOrbitClosingVisual";

describe("MindraOrbitClosingVisual", () => {
  it("renders all six orbit concepts as real text around the decorative figure", () => {
    render(<MindraOrbitClosingVisual />);
    for (const label of ["Memory", "Task", "Plan", "Family", "Maintenance", "Useful Knowledge"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("states the closing principle", () => {
    render(<MindraOrbitClosingVisual />);
    expect(screen.getByText("The person is the center. Mindra quietly supports the information around them.")).toBeInTheDocument();
  });

  it("does not render a glowing brain or dashboard-style visual", () => {
    const { container } = render(<MindraOrbitClosingVisual />);
    expect(container.textContent?.toLowerCase()).not.toContain("brain");
  });
});
