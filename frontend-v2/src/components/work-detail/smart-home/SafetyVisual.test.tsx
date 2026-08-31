import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetyVisual } from "./SafetyVisual";

describe("SafetyVisual", () => {
  it("renders all eight safety principles as real, visible text", () => {
    render(<SafetyVisual />);
    for (const principle of [
      "Rated and certified equipment where required",
      "Qualified electrician for electrical work",
      "Proper isolation",
      "Manual override, always available",
      "Fail-safe behaviour",
      "Controlled, deliberate automation",
      "Clear separation between low-voltage experimentation and household mains",
      "Validation before expansion",
    ]) {
      expect(screen.getByText(principle)).toBeInTheDocument();
    }
  });

  it("does not imply regulatory certification has already been achieved", () => {
    render(<SafetyVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/is certified/i);
    expect(text).not.toMatch(/certified by/i);
  });
});
