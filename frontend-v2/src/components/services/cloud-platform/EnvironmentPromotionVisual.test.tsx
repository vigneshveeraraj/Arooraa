import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EnvironmentPromotionVisual } from "./EnvironmentPromotionVisual";

describe("EnvironmentPromotionVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<EnvironmentPromotionVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows all four environments in promotion order", () => {
    const { container } = render(<EnvironmentPromotionVisual />);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(4);
    expect(items[0]?.textContent).toContain("Development");
    expect(items[1]?.textContent).toContain("Validation");
    expect(items[2]?.textContent).toContain("Staging");
    expect(items[3]?.textContent).toContain("Production");
  });
});
