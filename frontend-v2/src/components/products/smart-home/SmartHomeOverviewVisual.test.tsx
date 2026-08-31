import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeOverviewVisual } from "./SmartHomeOverviewVisual";

describe("SmartHomeOverviewVisual", () => {
  it("renders the real house-overview photograph with descriptive alt text", () => {
    render(<SmartHomeOverviewVisual />);
    const image = screen.getByRole("img", {
      name: "Concept visualization of a two-floor Arooraa Smart Home showing room status, AC state, energy usage and water-tank information.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-home/smart-home-house-overview-concept.webp");
  });

  it("restates the room/floor story as real, always-visible HTML, not just baked into the image", () => {
    render(<SmartHomeOverviewVisual />);
    expect(screen.getByText("First Floor Bedroom")).toBeInTheDocument();
    expect(screen.getByText(/AC On/)).toBeInTheDocument();
    expect(screen.getByText("Kids Room")).toBeInTheDocument();
    expect(screen.getByText("AC Off")).toBeInTheDocument();
    expect(screen.getByText("Ground Floor Bedroom")).toBeInTheDocument();
    expect(screen.getByText("Last month usage")).toBeInTheDocument();
    expect(screen.getByText("Living Room")).toBeInTheDocument();
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Water Tank")).toBeInTheDocument();
    expect(screen.getByText("Level visible")).toBeInTheDocument();
  });

  it("labels the room story as an example, not a live-state claim", () => {
    render(<SmartHomeOverviewVisual />);
    expect(screen.getByText("Example home view")).toBeInTheDocument();
  });
});
