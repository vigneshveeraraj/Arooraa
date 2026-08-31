import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivateToSharedVisual } from "./PrivateToSharedVisual";

describe("PrivateToSharedVisual", () => {
  it("labels the private and shared boundaries as real, visible text", () => {
    render(<PrivateToSharedVisual />);
    expect(screen.getByText("My Space")).toBeInTheDocument();
    expect(screen.getByText("Family Space")).toBeInTheDocument();
  });

  it("renders exactly one card crossing the boundary, not every card", () => {
    const { container } = render(<PrivateToSharedVisual />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    // 3 private cards + 1 crossing + 1 shared = 5 small card rects, plus 2 boundary rects = 7
    expect(container.querySelectorAll("rect")).toHaveLength(7);
  });

  it("renders all six trust principles as real text", () => {
    render(<PrivateToSharedVisual />);
    for (const principle of [
      "Authenticated access",
      "Personal and private boundaries",
      "Deliberate Family Space sharing",
      "Secure personal memory",
      "Safe access across devices",
      "User control over what becomes shared",
    ]) {
      expect(screen.getByText(principle)).toBeInTheDocument();
    }
  });
});
