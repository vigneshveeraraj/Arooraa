import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeSafetyVisual } from "./SmartHomeSafetyVisual";

describe("SmartHomeSafetyVisual", () => {
  it("shows the electrical-safety disclaimer as real, visible text", () => {
    render(<SmartHomeSafetyVisual />);
    expect(
      screen.getByText(
        /Arooraa Smart Home is currently a product\/prototype initiative\. Any mains-connected installation requires correctly rated, certified equipment and qualified electrical installation and sign-off\./,
      ),
    ).toBeInTheDocument();
  });

  it("shows safety-critical detectors alarming locally", () => {
    render(<SmartHomeSafetyVisual />);
    const text = document.body.textContent ?? "";
    expect(text).toContain("Smoke");
    expect(text).toContain("LPG");
    expect(text).toContain("Water Leak");
    expect(text).toMatch(/local alarm/i);
  });

  it("does not expose protection coordination or panel-level detail", () => {
    render(<SmartHomeSafetyVisual />);
    const text = document.body.textContent ?? "";
    const disallowed = [/ct sizing/i, /panel layout/i, /db schematic/i, /wire rating/i, /contactor sizing/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
