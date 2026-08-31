import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FrictionToDirectionVisual } from "./FrictionToDirectionVisual";

describe("FrictionToDirectionVisual", () => {
  it("renders the three zone captions as real text", () => {
    render(<FrictionToDirectionVisual />);
    expect(screen.getByText("Repeated Friction")).toBeInTheDocument();
    expect(screen.getByText("Observation")).toBeInTheDocument();
    expect(screen.getByText("Product Direction")).toBeInTheDocument();
  });

  it("keeps the scene itself decorative", () => {
    const { container } = render(<FrictionToDirectionVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
