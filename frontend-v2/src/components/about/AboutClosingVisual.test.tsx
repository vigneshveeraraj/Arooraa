import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AboutClosingVisual } from "./AboutClosingVisual";

describe("AboutClosingVisual", () => {
  it("is purely decorative with no text content", () => {
    const { container } = render(<AboutClosingVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });
});
