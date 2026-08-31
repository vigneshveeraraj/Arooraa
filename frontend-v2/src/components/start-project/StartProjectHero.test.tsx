import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StartProjectHero } from "./StartProjectHero";

describe("StartProjectHero", () => {
  it("renders the approved h1 headline and the no-specification reassurance", () => {
    render(<StartProjectHero />);
    expect(screen.getByRole("heading", { level: 1, name: "Tell us what should work better." })).toBeInTheDocument();
    expect(screen.getByText("No complete specification required. Start with the problem.")).toBeInTheDocument();
  });

  it("links the primary CTA to the form", () => {
    render(<StartProjectHero />);
    expect(screen.getByRole("link", { name: "Tell Us About the Project" })).toHaveAttribute("href", "#start-project-form");
  });
});
