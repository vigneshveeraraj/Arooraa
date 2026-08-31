import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartMirrorGlyphIcon, type SmartMirrorGlyph } from "./SmartMirrorGlyphIcon";

describe("SmartMirrorGlyphIcon", () => {
  it("renders a decorative svg for every glyph type", () => {
    const glyphs: SmartMirrorGlyph[] = [
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
      const { container, unmount } = render(<SmartMirrorGlyphIcon glyph={glyph} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      unmount();
    }
  });
});
