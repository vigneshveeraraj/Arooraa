import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayRhythmStoryboard } from "./DayRhythmStoryboard";

describe("DayRhythmStoryboard", () => {
  it("renders all four day-rhythm moments as real text, in order, in one list", () => {
    const { container } = render(<DayRhythmStoryboard />);
    const list = container.querySelector("ol")!;
    expect(list).toHaveAttribute("aria-label", "Smart Mirror moving through a day");
    expect(list.querySelectorAll("li")).toHaveLength(4);
    for (const name of ["Morning", "Leaving", "Evening", "Quiet"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("uses no raster images", () => {
    render(<DayRhythmStoryboard />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("lets content density recede across the day — the Quiet frame carries no cues", () => {
    const { container } = render(<DayRhythmStoryboard />);
    const frames = container.querySelectorAll('[class*="frame"]');
    expect(frames).toHaveLength(4);
    const quietFrame = frames[3]!;
    expect(quietFrame.querySelectorAll('[class*="cue"]')).toHaveLength(0);
  });
});
