import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SmartHomeHeroVisual } from "./SmartHomeHeroVisual";

describe("SmartHomeHeroVisual", () => {
  it("renders successfully with the home's systems as decorative nodes", () => {
    const { container } = render(<SmartHomeHeroVisual />);
    const text = container.textContent ?? "";
    expect(text).toContain("Energy");
    expect(text).toContain("Control");
    expect(text).toContain("Water");
    expect(text).toContain("Safety");
    expect(text).toContain("Manual Switch");
  });

  it("does not draw real wiring or an electrical schematic", () => {
    const { container } = render(<SmartHomeHeroVisual />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/230V|415V|MCB|RCCB|contactor/i);
  });
});
