import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorHeroVisual } from "./SmartMirrorHeroVisual";

describe("SmartMirrorHeroVisual", () => {
  it("renders the real Smart Mirror concept photograph with descriptive alt text", () => {
    render(<SmartMirrorHeroVisual />);
    const image = screen.getByRole("img", {
      name: "Concept visualization of AROORAA Smart Mirror displaying a morning briefing in a modern home.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-mirror/smart-mirror-hero-concept.webp");
  });

  it("shows a restrained concept caption, not a production claim", () => {
    render(<SmartMirrorHeroVisual />);
    expect(screen.getByText("Smart Mirror experience concept")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/production unit/i);
    expect(text).not.toMatch(/customer deployment/i);
  });
});
