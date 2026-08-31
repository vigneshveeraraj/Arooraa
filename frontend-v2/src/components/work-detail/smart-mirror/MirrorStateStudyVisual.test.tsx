import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MirrorStateStudyVisual } from "./MirrorStateStudyVisual";

describe("MirrorStateStudyVisual", () => {
  it("renders the three mirror states as real, visible text", () => {
    render(<MirrorStateStudyVisual />);
    for (const name of ["Quiet", "Glance", "Active Moment"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("Almost entirely a mirror.")).toBeInTheDocument();
  });

  it("renders one dominant hero mirror plus three small state thumbnails, restrained density throughout", () => {
    const { container } = render(<MirrorStateStudyVisual />);
    // the hero mirror scene, plus one thumbnail scene per state (3) = 4 decorative mirrors
    const mirrors = container.querySelectorAll('[aria-hidden="true"]');
    expect(mirrors).toHaveLength(4);
  });

  it("renders the mirror-first key line as visible text", () => {
    render(<MirrorStateStudyVisual />);
    expect(screen.getByText("If the technology gets in the way of the reflection, the product has failed.")).toBeInTheDocument();
  });
});
