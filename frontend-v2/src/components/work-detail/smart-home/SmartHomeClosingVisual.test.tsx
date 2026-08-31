import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartHomeClosingVisual } from "./SmartHomeClosingVisual";

describe("SmartHomeClosingVisual", () => {
  it("is a fully decorative, textless visual (the closing principle lives in SmartHomeClosingStory)", () => {
    const { container } = render(<SmartHomeClosingVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("uses no raster image", () => {
    const { container } = render(<SmartHomeClosingVisual />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
