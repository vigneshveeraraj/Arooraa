import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { NowFutureSplit } from "./NowFutureSplit";

describe("NowFutureSplit", () => {
  it("lists current foundation items separately from future-direction items", () => {
    render(<NowFutureSplit />);
    expect(screen.getByText("Available / Current Foundation")).toBeInTheDocument();
    expect(screen.getByText("Future Direction")).toBeInTheDocument();
    for (const item of ["Notes", "Tasks", "My Space", "Family Space", "Today", "Mobile + Web"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    for (const item of ["Richer voice interaction", "Natural-language capture", "AI-supported retrieval / organization"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("never mixes a future item into the current-foundation list", () => {
    render(<NowFutureSplit />);
    const nowColumn = screen.getByText("Available / Current Foundation").parentElement!;
    for (const futureItem of ["Richer voice interaction", "Natural-language capture", "Contextual assistance"]) {
      expect(within(nowColumn).queryByText(futureItem)).not.toBeInTheDocument();
    }
  });
});
