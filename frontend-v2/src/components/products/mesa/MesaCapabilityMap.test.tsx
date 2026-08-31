import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaCapabilityMap } from "./MesaCapabilityMap";

describe("MesaCapabilityMap", () => {
  it("labels all five approved capability areas as real, accessible text", () => {
    render(<MesaCapabilityMap />);
    for (const name of [
      "Digital Dining",
      "Kitchen Coordination",
      "Staff Operations",
      "Billing & Commerce",
      "Restaurant Management",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("keeps the connecting link layer and every node icon decorative", () => {
    const { container } = render(<MesaCapabilityMap />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(6);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("does not expose internal architecture terms", () => {
    render(<MesaCapabilityMap />);
    const text = document.body.textContent ?? "";
    const disallowed = [/commerce core/i, /database/i, /\bevent\b/i, /\bsync\b/i, /module/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
