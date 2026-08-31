import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AboutSpark } from "./AboutSpark";

describe("AboutSpark", () => {
  it("is purely decorative — aria-hidden with no text content", () => {
    const { container } = render(<AboutSpark />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("");
  });

  it("accepts a custom size", () => {
    const { container } = render(<AboutSpark size={48} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });
});
