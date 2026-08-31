import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeJourneyVisual } from "./SmartHomeJourneyVisual";

describe("SmartHomeJourneyVisual", () => {
  it("shows the four-step prototype journey as real, accessible text", () => {
    render(<SmartHomeJourneyVisual />);
    for (const title of ["Understand the home", "Prove local reliability", "Make energy visible", "Expand carefully"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("does not expose internal phase numbers", () => {
    render(<SmartHomeJourneyVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/phase 0/i);
    expect(text).not.toMatch(/phase 1/i);
    expect(text).not.toMatch(/phase 7/i);
  });
});
