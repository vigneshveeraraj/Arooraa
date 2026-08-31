import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stories } from "./Stories";
import { FEATURED_STORY, FUTURE_STORY, SUPPORTING_STORIES } from "@/lib/content/stories";

describe("Stories", () => {
  it("shows MESA, Mindra and Smart Mirror stories, with M² absent from public text", () => {
    render(<Stories />);
    expect(screen.getByText(FEATURED_STORY.title)).toBeInTheDocument();
    for (const story of SUPPORTING_STORIES) {
      expect(screen.getByText(story.title)).toBeInTheDocument();
    }
    expect(screen.getByText("Smart Mirror")).toBeInTheDocument();
    expect(screen.queryByText("M²")).not.toBeInTheDocument();
  });

  it("explicitly labels the future scenario as vision, not current capability", () => {
    render(<Stories />);
    expect(screen.getByText(FUTURE_STORY.label)).toBeInTheDocument();
    expect(screen.getByText(FUTURE_STORY.badge)).toBeInTheDocument();
    expect(screen.getByText(FUTURE_STORY.scenario)).toBeInTheDocument();

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/currently (available|supports|notices)/i);
    expect(text).not.toMatch(/mesa (is|does) now/i);
  });
});
