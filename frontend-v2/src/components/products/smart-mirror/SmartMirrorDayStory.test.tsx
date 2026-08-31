import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorDayStory } from "./SmartMirrorDayStory";

describe("SmartMirrorDayStory", () => {
  it("shows the real morning concept photograph", () => {
    render(<SmartMirrorDayStory />);
    const image = screen.getByRole("img", {
      name: "Concept visualization of AROORAA Smart Mirror in a bedroom in the morning, showing the time, weather, a first meeting and a family reminder.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-mirror/smart-mirror-morning-concept.webp");
    expect(screen.getByText(/Morning/)).toBeInTheDocument();
  });

  it("shows the evening moment as real text, not a duplicate mirror mockup", () => {
    render(<SmartMirrorDayStory />);
    expect(screen.getByText(/Evening/)).toBeInTheDocument();
    expect(screen.getByText("Tomorrow's first appointment")).toBeInTheDocument();
    expect(screen.getByText("Home energy summary")).toBeInTheDocument();
    expect(screen.getByText("Good Night routine")).toBeInTheDocument();
  });

  it("shows the glance/ask/act/return rhythm as real, accessible text", () => {
    render(<SmartMirrorDayStory />);
    for (const step of ["Glance", "Ask", "Act", "Return to your reflection"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it("does not claim voice or recognition is already shipped", () => {
    render(<SmartMirrorDayStory />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/wake word is shipped/i);
    expect(text).not.toMatch(/recognition is complete/i);
    expect(text).not.toMatch(/available today/i);
  });
});
