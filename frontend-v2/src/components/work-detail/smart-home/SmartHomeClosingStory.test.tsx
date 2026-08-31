import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeClosingStory } from "./SmartHomeClosingStory";

describe("SmartHomeClosingStory", () => {
  it("renders the closing title and supporting text, and is dark-toned", () => {
    render(<SmartHomeClosingStory />);
    expect(
      screen.getByRole("heading", { level: 2, name: "A connected home should become more useful without becoming more fragile." }),
    ).toBeInTheDocument();
    expect(document.getElementById("closing-story")).toHaveAttribute("data-tone", "dark");
  });

  it("renders the closing principle as real, visible text beside the visual", () => {
    render(<SmartHomeClosingStory />);
    expect(screen.getByText("The smartest home may be the one that quietly works the way people already expect a home to work.")).toBeInTheDocument();
  });
});
