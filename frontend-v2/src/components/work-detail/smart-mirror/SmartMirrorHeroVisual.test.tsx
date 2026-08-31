import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorHeroVisual } from "./SmartMirrorHeroVisual";

describe("SmartMirrorHeroVisual", () => {
  it("renders the home/morning hero image exactly once with a concept caption", () => {
    render(<SmartMirrorHeroVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-mirror/story/home-morning.webp");
    expect(img).toHaveAttribute("loading", "eager");
    expect(screen.getByText(/concept illustration/i)).toBeInTheDocument();
  });
});
