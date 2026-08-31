import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraDayStory } from "./MindraDayStory";

describe("MindraDayStory", () => {
  it("renders the three moments of the day, in order, as real accessible text", () => {
    render(<MindraDayStory />);
    const items = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(items).toEqual([
      "MorningCheck today's plan",
      "During the DayCapture, add, assign",
      "EveningReview and plan ahead",
    ]);
  });

  it("does not present the product as autonomous AI", () => {
    render(<MindraDayStory />);
    const text = document.body.textContent ?? "";
    const disallowed = [/autonomous/i, /ai assistant/i, /automatically decides/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
