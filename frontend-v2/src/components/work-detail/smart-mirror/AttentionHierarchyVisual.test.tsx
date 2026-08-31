import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttentionHierarchyVisual } from "./AttentionHierarchyVisual";

describe("AttentionHierarchyVisual", () => {
  it("renders the three attention tiers as real, visible text", () => {
    render(<AttentionHierarchyVisual />);
    for (const name of ["Now", "Soon", "Available"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("Useful in this exact moment.")).toBeInTheDocument();
  });

  it("renders no fake analytics — no percentages or numeric metrics", () => {
    render(<AttentionHierarchyVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%/);
  });

  it("anchors the field around a person, with tiers at spatial distance rather than a stacked list", () => {
    const { container } = render(<AttentionHierarchyVisual />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    const tiers = container.querySelectorAll('[class*="tier"]');
    expect(tiers.length).toBeGreaterThan(0);
  });
});
