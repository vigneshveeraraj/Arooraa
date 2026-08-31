import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { EdgeFoundationVisual } from "./EdgeFoundationVisual";

describe("EdgeFoundationVisual", () => {
  it("renders the three stages as real text, in order, in one list", () => {
    const { container } = render(<EdgeFoundationVisual />);
    const list = container.querySelector("ol")!;
    const items = Array.from(list.querySelectorAll("li")).map((li) => li.textContent);
    expect(items[0]).toContain("Mirror Experience");
    expect(items[1]).toContain("Local Product Runtime");
    expect(items[2]).toContain("Physical Environment");
  });

  it("frames the Raspberry Pi 5 prototype honestly — not a partnership or certification claim", () => {
    render(<EdgeFoundationVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/is an official Raspberry Pi partnership/i);
    expect(text).not.toMatch(/certified by/i);
    expect(text).toMatch(/not a final production hardware commitment/i);
    expect(text).toMatch(/not a final production hardware commitment, a Raspberry Pi partnership, or a certification claim/i);
  });
});
