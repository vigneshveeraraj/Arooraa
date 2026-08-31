import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartHomeWaterVisual } from "./SmartHomeWaterVisual";

describe("SmartHomeWaterVisual", () => {
  it("renders successfully and stays out of the accessibility tree", () => {
    const { container } = render(<SmartHomeWaterVisual />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the sump/motor/overhead tank concept with manual override", () => {
    const { container } = render(<SmartHomeWaterVisual />);
    const text = container.textContent ?? "";
    expect(text).toContain("Sump Tank");
    expect(text).toContain("Motor");
    expect(text).toContain("Overhead Tank");
    expect(text).toContain("Manual override");
  });

  it("does not expose motor-contact wiring or a technical control schematic", () => {
    const { container } = render(<SmartHomeWaterVisual />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/contactor/i);
    expect(text).not.toMatch(/wiring/i);
    expect(text).not.toMatch(/relay/i);
  });
});
