import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MesaIcon, MindraIcon, SmartMirrorIcon, SmartHomeIcon } from "./AboutProductIcons";

describe("AboutProductIcons", () => {
  it("renders all four glyphs as decorative svg", () => {
    for (const Icon of [MesaIcon, MindraIcon, SmartMirrorIcon, SmartHomeIcon]) {
      const { container } = render(<Icon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(container.textContent).toBe("");
    }
  });
});
