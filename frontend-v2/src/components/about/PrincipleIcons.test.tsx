import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  SolveRealProblemIcon,
  ReduceComplexityIcon,
  BuildForChangeIcon,
  ReliabilityIcon,
  SecurityByDesignIcon,
  EarnedComplexityIcon,
  EvidenceIcon,
  HumanControlIcon,
  OperateIcon,
} from "./PrincipleIcons";

describe("PrincipleIcons", () => {
  it("renders all nine glyphs as decorative svg", () => {
    const icons = [
      SolveRealProblemIcon,
      ReduceComplexityIcon,
      BuildForChangeIcon,
      ReliabilityIcon,
      SecurityByDesignIcon,
      EarnedComplexityIcon,
      EvidenceIcon,
      HumanControlIcon,
      OperateIcon,
    ];
    expect(icons).toHaveLength(9);
    for (const Icon of icons) {
      const { container } = render(<Icon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(container.textContent).toBe("");
    }
  });
});
