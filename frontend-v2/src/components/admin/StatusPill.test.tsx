import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill, humanizeStatus } from "./StatusPill";
import { LEAD_STATUSES } from "@/lib/admin/types";

describe("StatusPill", () => {
  it.each(LEAD_STATUSES)("renders a readable label for %s", (status) => {
    render(<StatusPill status={status} />);
    expect(screen.getByText(humanizeStatus(status))).toBeInTheDocument();
  });

  it("never relies on color alone — the status text is always present in the DOM", () => {
    render(<StatusPill status="WON" />);
    // A screen reader (or a colorblind user) gets the same information as
    // the pill's color: the text content itself.
    expect(screen.getByText("Won").textContent).toBe("Won");
  });

  it("applies a distinct visual class per status so the seven pills are never identical", () => {
    const classes = new Set<string>();
    for (const status of LEAD_STATUSES) {
      const { container, unmount } = render(<StatusPill status={status} />);
      classes.add(container.querySelector("span")!.className);
      unmount();
    }
    expect(classes.size).toBe(LEAD_STATUSES.length);
  });
});
