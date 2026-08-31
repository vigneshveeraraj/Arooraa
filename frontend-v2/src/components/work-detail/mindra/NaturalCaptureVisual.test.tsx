import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NaturalCaptureVisual } from "./NaturalCaptureVisual";

describe("NaturalCaptureVisual", () => {
  it("renders the four current capture types as real text", () => {
    render(<NaturalCaptureVisual />);
    for (const label of ["Notes", "Tasks", "Bookmarks", "Contacts"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders personal-work examples, not enterprise work-management language", () => {
    render(<NaturalCaptureVisual />);
    for (const item of ["Ideas", "Research", "Personal projects", "Learning notes"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("visually and textually separates voice capture as a future direction", () => {
    render(<NaturalCaptureVisual />);
    expect(screen.getByText("Future direction")).toBeInTheDocument();
    expect(screen.getByText("Voice capture")).toBeInTheDocument();
  });
});
