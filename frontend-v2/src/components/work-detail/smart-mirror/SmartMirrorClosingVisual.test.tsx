import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartMirrorClosingVisual } from "./SmartMirrorClosingVisual";

describe("SmartMirrorClosingVisual", () => {
  it("is a fully decorative, textless visual (the closing principle lives in SmartMirrorClosingStory)", () => {
    const { container } = render(<SmartMirrorClosingVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("uses no raster image and no glowing-brain iconography", () => {
    const { container } = render(<SmartMirrorClosingVisual />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
