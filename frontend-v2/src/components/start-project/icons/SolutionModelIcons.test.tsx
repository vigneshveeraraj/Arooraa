import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  NewProductIcon,
  ExistingProductIcon,
  AiDataIcon,
  ModernizationIcon,
  CloudPlatformIcon,
  ContinuousEngineeringIcon,
  ConnectedProductIcon,
  NeedsGuidanceIcon,
} from "./SolutionModelIcons";

describe("SolutionModelIcons", () => {
  it("renders all eight glyphs as decorative svg", () => {
    const icons = [
      NewProductIcon,
      ExistingProductIcon,
      AiDataIcon,
      ModernizationIcon,
      CloudPlatformIcon,
      ContinuousEngineeringIcon,
      ConnectedProductIcon,
      NeedsGuidanceIcon,
    ];
    expect(icons).toHaveLength(8);
    for (const Icon of icons) {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });
});
