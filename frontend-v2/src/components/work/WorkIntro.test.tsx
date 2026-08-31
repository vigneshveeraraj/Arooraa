import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkIntro } from "./WorkIntro";

describe("WorkIntro", () => {
  it("renders the credibility statement as a heading and supporting copy", () => {
    render(<WorkIntro />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We build our own products because building teaches things planning alone cannot.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Product decisions become clearer/)).toBeInTheDocument();
  });
});
