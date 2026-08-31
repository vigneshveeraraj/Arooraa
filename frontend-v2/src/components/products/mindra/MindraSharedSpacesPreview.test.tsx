import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindraSharedSpacesPreview } from "./MindraSharedSpacesPreview";

describe("MindraSharedSpacesPreview", () => {
  it("explains My Space and Family Space as real, accessible text", () => {
    render(<MindraSharedSpacesPreview />);
    expect(screen.getByText("My Space")).toBeInTheDocument();
    expect(screen.getByText("Personal information stays private to you.")).toBeInTheDocument();
    expect(screen.getByText("Family Space")).toBeInTheDocument();
    expect(
      screen.getByText("Shared household information is visible only to your trusted household."),
    ).toBeInTheDocument();
  });

  it("makes the intentional-sharing relationship clear with a plain-language cue", () => {
    render(<MindraSharedSpacesPreview />);
    expect(screen.getByText("shared deliberately")).toBeInTheDocument();
  });

  it("shows illustrative phone-glimpse content for each space", () => {
    const { container } = render(<MindraSharedSpacesPreview />);
    const text = container.textContent ?? "";
    for (const fragment of ["Private reminder", "A personal note", "Shared shopping", "Family note", "Home tasks"]) {
      expect(text).toContain(fragment);
    }
  });

  it("does not expose backend authorization mechanics", () => {
    render(<MindraSharedSpacesPreview />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /household id/i,
      /user id/i,
      /guard/i,
      /repository/i,
      /membership state/i,
      /jwt/i,
      /architecture/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
