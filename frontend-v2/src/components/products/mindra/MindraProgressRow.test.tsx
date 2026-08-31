import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraProgressRow } from "./MindraProgressRow";

describe("MindraProgressRow", () => {
  it("renders a plain count, not a percentage", () => {
    render(<MindraProgressRow current={3} total={6} />);
    expect(screen.getByText("3 of 6")).toBeInTheDocument();
  });

  it("does not publish a fabricated percentage or metric", () => {
    render(<MindraProgressRow current={3} total={6} />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/%/);
  });

  it("keeps the segment bar decorative", () => {
    const { container } = render(<MindraProgressRow current={3} total={6} />);
    const bar = container.querySelector("[aria-hidden]");
    expect(bar).toHaveAttribute("aria-hidden", "true");
  });
});
