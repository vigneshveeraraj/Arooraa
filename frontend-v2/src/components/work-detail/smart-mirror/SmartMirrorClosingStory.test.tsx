import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartMirrorClosingStory } from "./SmartMirrorClosingStory";

describe("SmartMirrorClosingStory", () => {
  it("renders the closing title and supporting text, and is dark-toned", () => {
    render(<SmartMirrorClosingStory />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Smart Mirror started with a mirror. The bigger question is how technology should exist around us." }),
    ).toBeInTheDocument();
    expect(document.getElementById("closing-story")).toHaveAttribute("data-tone", "dark");
  });

  it("renders the closing principle as real, visible text beside the visual", () => {
    render(<SmartMirrorClosingStory />);
    expect(screen.getByText("The future of computing does not always need to look like a computer.")).toBeInTheDocument();
  });
});
