import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TableQrGlyph } from "./TableQrGlyph";

describe("TableQrGlyph", () => {
  it("renders a decorative, aria-hidden, textless graphic with no link", () => {
    const { container } = render(<TableQrGlyph />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });

  it("supports a smaller size variant", () => {
    const { container } = render(<TableQrGlyph size="sm" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
