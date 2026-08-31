import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ModernizationStrategyVisual } from "./ModernizationStrategyVisual";

describe("ModernizationStrategyVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<ModernizationStrategyVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the six phases in order", () => {
    const { container } = render(<ModernizationStrategyVisual />);
    const text = container.textContent ?? "";
    expect(text).toBe("UnderstandStabilizeIsolateModernizeValidateEvolve");
  });
});
