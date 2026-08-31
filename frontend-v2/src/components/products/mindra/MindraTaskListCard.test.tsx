import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraTaskListCard } from "./MindraTaskListCard";

describe("MindraTaskListCard", () => {
  it("renders its label as real text for every kind", () => {
    for (const kind of ["task", "grocery", "meal", "note", "family"] as const) {
      const { unmount } = render(<MindraTaskListCard label={`A ${kind} item`} kind={kind} />);
      expect(screen.getByText(`A ${kind} item`)).toBeInTheDocument();
      unmount();
    }
  });

  it("keeps its color dot decorative", () => {
    const { container } = render(<MindraTaskListCard label="Buy vegetables" kind="grocery" />);
    const dot = container.querySelector("span[aria-hidden]");
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an optional status tag as real text without it being gamified", () => {
    render(<MindraTaskListCard label="Pay school fee" kind="family" tag="Family" />);
    expect(screen.getByText("Family")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/points/i);
    expect(text).not.toMatch(/streak/i);
  });

  it("omits the tag entirely when none is supplied", () => {
    const { container } = render(<MindraTaskListCard label="3 notes" kind="note" />);
    expect(container.querySelectorAll("span").length).toBe(2);
  });
});
