import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeEngineeringVisual } from "./SmartHomeEngineeringVisual";

describe("SmartHomeEngineeringVisual", () => {
  it("names Raspberry Pi 5 with prototype-only framing as real, visible text", () => {
    render(<SmartHomeEngineeringVisual />);
    expect(
      screen.getByText(
        /The prototype direction uses Raspberry Pi 5 as the local gateway for early home automation and integration experiments\./,
      ),
    ).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/official raspberry pi partner/i);
    expect(text).not.toMatch(/certified partner/i);
  });

  it("mentions ESP32 low-voltage experimentation kept separate from mains", () => {
    render(<SmartHomeEngineeringVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/ESP32/);
    expect(text).toMatch(/separately from household mains/i);
  });

  it("does not expose MQTT topics, wiring, ports, meter models or credentials", () => {
    render(<SmartHomeEngineeringVisual />);
    const text = document.body.textContent ?? "";
    const disallowed = [/mqtt/i, /\bport \d/i, /serial pinout/i, /meter model/i, /ct ratio/i, /credential/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
