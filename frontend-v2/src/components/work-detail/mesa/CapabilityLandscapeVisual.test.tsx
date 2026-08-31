import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapabilityLandscapeVisual } from "./CapabilityLandscapeVisual";

describe("CapabilityLandscapeVisual", () => {
  it("renders all six clusters spatially, with Intelligence marked as a future direction", () => {
    const { container } = render(<CapabilityLandscapeVisual />);
    for (const name of ["Dine-In", "Restaurant Operations", "Kitchen", "Billing / POS", "Management", "Intelligence"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("Future Direction")).toBeInTheDocument();
    // 5 faint proximity connectors from the Dine-In hub to every other cluster
    expect(container.querySelectorAll("line")).toHaveLength(5);
  });
});
