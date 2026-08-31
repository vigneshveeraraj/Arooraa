import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutClosingStory } from "./AboutClosingStory";

describe("AboutClosingStory", () => {
  it("renders the closing heading, principle line and both CTAs", () => {
    render(<AboutClosingStory />);
    expect(
      screen.getByRole("heading", { level: 2, name: "There should always be room to ask whether something can work better." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Notice the pain. Understand the problem. Reduce the complexity. Build something better."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveAttribute("href", "/our-work");
  });

  it("is the page's other dark-toned section", () => {
    render(<AboutClosingStory />);
    expect(document.getElementById("closing")).toHaveAttribute("data-tone", "dark");
  });
});
