import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductDecisionSequence } from "./ProductDecisionSequence";

describe("ProductDecisionSequence", () => {
  it("renders all five decisions with their number, title and description, and a scene frame each", () => {
    const { container } = render(<ProductDecisionSequence />);
    for (const number of ["01", "02", "03", "04", "05"]) {
      expect(screen.getByText(`Decision ${number}`)).toBeInTheDocument();
    }
    expect(screen.getByText("Make the table the shared context.")).toBeInTheDocument();
    expect(screen.getByText("Treat recovery and exceptions as product design, not afterthoughts.")).toBeInTheDocument();
    // 5 scene frames + 4 decorative guest-control icons on Decision 02 = 9
    expect(container.querySelectorAll("svg")).toHaveLength(9);
  });

  it("W2.1.2B: Decision 02 explicitly communicates guest-controlled table actions, reinforced by a small icon row", () => {
    render(<ProductDecisionSequence />);
    expect(screen.getByText(/scan the table QR, browse, order and call a waiter directly/)).toBeInTheDocument();
  });

  it("makes the table progressively more solid across the five frames", () => {
    const { container } = render(<ProductDecisionSequence />);
    const tables = container.querySelectorAll("ellipse");
    expect(tables).toHaveLength(5);
    const firstOpacity = Number(tables[0]!.getAttribute("style")?.match(/opacity:\s*([\d.]+)/)?.[1]);
    const lastOpacity = Number(tables[4]!.getAttribute("style")?.match(/opacity:\s*([\d.]+)/)?.[1]);
    expect(lastOpacity).toBeGreaterThan(firstOpacity);
  });
});
