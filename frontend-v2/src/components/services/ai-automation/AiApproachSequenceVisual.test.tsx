import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AiApproachSequenceVisual } from "./AiApproachSequenceVisual";

describe("AiApproachSequenceVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<AiApproachSequenceVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the six approach steps in order", () => {
    const { container } = render(<AiApproachSequenceVisual />);
    const text = container.textContent ?? "";
    expect(text).toBe("UnderstandIdentifyValidatePrototypeEngineerLaunch & Improve");
  });
});
