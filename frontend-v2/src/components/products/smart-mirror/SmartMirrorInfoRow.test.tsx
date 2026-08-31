import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorInfoRow } from "./SmartMirrorInfoRow";

describe("SmartMirrorInfoRow", () => {
  it("renders its label and optional detail as real text", () => {
    render(<SmartMirrorInfoRow glyph="event" label="Team sync" detail="9:30 AM" />);
    expect(screen.getByText("Team sync")).toBeInTheDocument();
    expect(screen.getByText("9:30 AM")).toBeInTheDocument();
  });

  it("keeps its glyph icon decorative", () => {
    const { container } = render(<SmartMirrorInfoRow glyph="weather" label="22°C" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders correctly for every glyph type", () => {
    const glyphs: Array<Parameters<typeof SmartMirrorInfoRow>[0]["glyph"]> = [
      "time",
      "weather",
      "event",
      "reminder",
      "family",
      "home",
      "energy",
      "memory",
      "security",
      "wellness",
    ];
    for (const glyph of glyphs) {
      const { unmount, container } = render(<SmartMirrorInfoRow glyph={glyph} label={`A ${glyph} row`} />);
      expect(screen.getByText(`A ${glyph} row`)).toBeInTheDocument();
      expect(container.querySelector("svg")).toBeInTheDocument();
      unmount();
    }
  });
});
