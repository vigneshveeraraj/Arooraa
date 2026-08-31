import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { OperatingLoopVisual } from "./OperatingLoopVisual";

describe("OperatingLoopVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<OperatingLoopVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows all seven operating-loop stages in clockwise reading order", () => {
    const { container } = render(<OperatingLoopVisual />);
    const stages = container.querySelectorAll("span");
    expect(stages).toHaveLength(7);
    expect(Array.from(stages).map((el) => el.textContent)).toEqual([
      "Observe",
      "Triage",
      "Prioritize",
      "Fix",
      "Release",
      "Learn",
      "Improve",
    ]);
  });

  it("S8: tends the loop's hub with the shared editorial figure", () => {
    const { container } = render(<OperatingLoopVisual />);
    expect(container.querySelector("svg g")).toBeInTheDocument();
  });
});
