import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SmartMirrorScatteredToCalm } from "./SmartMirrorScatteredToCalm";

describe("SmartMirrorScatteredToCalm", () => {
  it("shows the scattered apps as real, accessible text", () => {
    render(<SmartMirrorScatteredToCalm />);
    const scattered = within(screen.getByTestId("scattered-panel"));
    for (const app of ["Calendar App", "Chat App", "Vendor App", "Wellness App"]) {
      expect(scattered.getByText(app)).toBeInTheDocument();
    }
  });

  it("shows the calm mirror surface as real text", () => {
    render(<SmartMirrorScatteredToCalm />);
    expect(screen.getByText("One calm surface")).toBeInTheDocument();
  });

  it("does not name real smart-home vendors", () => {
    render(<SmartMirrorScatteredToCalm />);
    const text = document.body.textContent ?? "";
    const disallowed = [/google/i, /amazon/i, /apple/i, /samsung/i, /alexa/i, /nest/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
