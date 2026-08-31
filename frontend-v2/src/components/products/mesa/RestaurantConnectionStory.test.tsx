import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RestaurantConnectionStory } from "./RestaurantConnectionStory";

describe("RestaurantConnectionStory", () => {
  it("renders both the before and after groups", () => {
    render(<RestaurantConnectionStory />);
    expect(screen.getByText("Before MESA")).toBeInTheDocument();
    expect(screen.getByText("With MESA")).toBeInTheDocument();
  });

  it("shows the same four restaurant-facing areas as real, accessible text on both sides", () => {
    render(<RestaurantConnectionStory />);
    const before = within(screen.getByTestId("before-panel"));
    const after = within(screen.getByTestId("after-panel"));

    for (const area of ["Guest & Table", "Service & Team", "Kitchen", "Business View"]) {
      expect(before.getByText(area)).toBeInTheDocument();
      expect(after.getByText(area)).toBeInTheDocument();
    }
  });

  it("keeps every icon and the connecting thread decorative", () => {
    const { container } = render(<RestaurantConnectionStory />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("does not expose internal architecture or workflow mechanics", () => {
    render(<RestaurantConnectionStory />);
    const text = document.body.textContent ?? "";
    const disallowed = [/commerce core/i, /database/i, /\bapi\b/i, /\bevent\b/i, /sync/i, /state transition/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
