import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AboutHeroVisual } from "./AboutHeroVisual";

describe("AboutHeroVisual", () => {
  it("is purely decorative — the hero headline/supporting copy already carries the meaning", () => {
    const { container } = render(<AboutHeroVisual />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });
});
