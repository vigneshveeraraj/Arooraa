import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  DiscoverDefineIcon,
  DesignBuildIcon,
  ImproveModernizeIcon,
  AddAiAutomationIcon,
  EngineeringCollaborationIcon,
  ContinuousPartnerIcon,
  NeedsRecommendationIcon,
} from "./EngagementModelIcons";

describe("EngagementModelIcons", () => {
  it("renders all seven glyphs as decorative svg", () => {
    const icons = [
      DiscoverDefineIcon,
      DesignBuildIcon,
      ImproveModernizeIcon,
      AddAiAutomationIcon,
      EngineeringCollaborationIcon,
      ContinuousPartnerIcon,
      NeedsRecommendationIcon,
    ];
    expect(icons).toHaveLength(7);
    for (const Icon of icons) {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
  });
});
