import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartHomeLocalFirstVisual } from "./SmartHomeLocalFirstVisual";

describe("SmartHomeLocalFirstVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<SmartHomeLocalFirstVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the Home -> Local Home Layer -> Optional Cloud concept only", () => {
    const { container } = render(<SmartHomeLocalFirstVisual />);
    const text = container.textContent ?? "";
    expect(text).toContain("Local Home Layer");
    expect(text).toContain("Works inside the home");
    expect(text).toContain("Optional Cloud");
  });

  it("does not expose network/protocol implementation detail", () => {
    const { container } = render(<SmartHomeLocalFirstVisual />);
    const text = container.textContent ?? "";
    const disallowed = [/mqtt/i, /\bport \d/i, /vlan/i, /ip address/i, /database/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
