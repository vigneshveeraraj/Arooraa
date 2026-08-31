import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FounderThinkingWallVisual } from "./FounderThinkingWallVisual";

describe("FounderThinkingWallVisual", () => {
  it("renders the four thinking-wall questions as real text", () => {
    render(<FounderThinkingWallVisual />);
    expect(screen.getByText("Why does this take so long?")).toBeInTheDocument();
    expect(screen.getByText("Why are we repeating this?")).toBeInTheDocument();
    expect(screen.getByText("What if these two sides were connected?")).toBeInTheDocument();
    expect(screen.getByText("Can this be simpler?")).toBeInTheDocument();
  });
});
