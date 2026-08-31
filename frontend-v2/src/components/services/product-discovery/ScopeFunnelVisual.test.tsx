import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ScopeFunnelVisual } from "./ScopeFunnelVisual";

describe("ScopeFunnelVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<ScopeFunnelVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the four illustrative scope-narrowing stages, not a proprietary scoring framework", () => {
    const { container } = render(<ScopeFunnelVisual />);
    const text = container.textContent ?? "";
    expect(text).toContain("Everything we could build");
    expect(text).toContain("What creates value");
    expect(text).toContain("What is feasible");
    expect(text).toContain("What belongs in MVP");
  });
});
