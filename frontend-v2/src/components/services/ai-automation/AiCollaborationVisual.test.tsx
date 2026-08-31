import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiCollaborationVisual } from "./AiCollaborationVisual";

describe("AiCollaborationVisual", () => {
  it("renders an aria-hidden svg with no text content", () => {
    const { container } = render(<AiCollaborationVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("S8: represents the human side with the shared editorial figure, not an abstract orb", () => {
    const { container } = render(<AiCollaborationVisual />);
    expect(container.querySelector("g")).toBeInTheDocument();
    expect(container.querySelectorAll("rect")).toHaveLength(3);
  });
});
