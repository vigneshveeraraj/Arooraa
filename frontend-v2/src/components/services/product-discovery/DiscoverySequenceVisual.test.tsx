import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DiscoverySequenceVisual } from "./DiscoverySequenceVisual";

describe("DiscoverySequenceVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<DiscoverySequenceVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the five discovery steps in order", () => {
    const { container } = render(<DiscoverySequenceVisual />);
    const text = container.textContent ?? "";
    expect(text).toBe("UnderstandDiscoverDefineValidatePlan");
  });
});
