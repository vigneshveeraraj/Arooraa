import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { describeAuraState, type AuraState } from "@/lib/aura/state";
import { AuraMark } from "./AuraMark";

const STATES: AuraState[] = ["IDLE", "INPUT_ACTIVE", "THINKING", "RESPONSE_READY", "ERROR"];

describe("AuraMark", () => {
  it.each(STATES)("carries %s to CSS as a data attribute", (state) => {
    const { container } = render(<AuraMark state={state} />);

    expect(container.querySelector("[data-state]")).toHaveAttribute("data-state", state);
  });

  it("is decorative, so assistive technology is told to skip it", () => {
    // The state is announced as text by the panel's status region; the mark repeating it would
    // just be noise in a screen reader.
    const { container } = render(<AuraMark state="THINKING" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("names every state in words for the panel's status region", () => {
    const described = STATES.map(describeAuraState);

    expect(new Set(described).size).toBe(STATES.length);
    for (const text of described) {
      expect(text).toMatch(/^Aura /);
    }
  });

  // --- A4.1: the orb is rejected; this is the Aura Spark ------------------------------------

  it("renders as the Aura Spark — real SVG geometry, not a circular orb", () => {
    const { container } = render(<AuraMark state="IDLE" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
    // A core plus four rays: five shapes, none of them a <circle>.
    expect(container.querySelectorAll("rect").length).toBe(5);
    expect(container.querySelectorAll("circle").length).toBe(0);
  });

  it("shapes the four rays asymmetrically rather than as a symmetric pinwheel", () => {
    const { container } = render(<AuraMark state="IDLE" />);

    const rects = Array.from(container.querySelectorAll("rect"));
    // The core is the square rotated 45deg; the other four are the rays, each a distinct length.
    const rayLengths = rects
      .filter((rect) => rect.getAttribute("transform") !== "rotate(45 16 16)")
      .map((rect) => rect.getAttribute("height"));
    expect(new Set(rayLengths).size).toBe(4);
  });
});
