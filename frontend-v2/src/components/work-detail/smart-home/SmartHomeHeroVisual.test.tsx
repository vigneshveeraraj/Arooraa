import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeHeroVisual } from "./SmartHomeHeroVisual";

describe("SmartHomeHeroVisual", () => {
  it("renders the hero image exactly once with a concept caption", () => {
    render(<SmartHomeHeroVisual />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/work/smart-home/story/hero.webp");
    expect(img).toHaveAttribute("loading", "eager");
    expect(screen.getByText(/concept illustration/i)).toBeInTheDocument();
  });
});
