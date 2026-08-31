import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PlatformApproachVisual } from "./PlatformApproachVisual";

describe("PlatformApproachVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<PlatformApproachVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the seven approach steps in order", () => {
    const { container } = render(<PlatformApproachVisual />);
    const text = container.textContent ?? "";
    expect(text).toBe("UnderstandDefineEstablishObserveHardenValidateEvolve");
  });
});
