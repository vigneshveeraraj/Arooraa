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
});
