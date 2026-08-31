import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartHomeManualControlVisual } from "./SmartHomeManualControlVisual";

describe("SmartHomeManualControlVisual", () => {
  it("shows the wall switch + local control + mobile coexistence caption as real text", () => {
    render(<SmartHomeManualControlVisual />);
    expect(screen.getByText("Smart when connected. Usable even when it isn't.")).toBeInTheDocument();
    expect(screen.getByText("Physical switch remains usable.")).toBeInTheDocument();
    expect(screen.getByText("Local control remains available.")).toBeInTheDocument();
    expect(screen.getByText("Mobile control adds convenience.")).toBeInTheDocument();
  });

  it("renders the real mobile-app concept photograph with descriptive alt text", () => {
    render(<SmartHomeManualControlVisual />);
    const image = screen.getByRole("img", {
      name: "Concept visualization of the Arooraa Smart Home mobile experience showing room controls, AC status, energy usage, lights and water-tank information.",
    });
    expect(image).toHaveAttribute("src", "/images/products/smart-home/smart-home-mobile-control-concept.webp");
  });

  it("does not promise offline behavior for unvalidated cloud-dependent devices", () => {
    render(<SmartHomeManualControlVisual />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/works fully offline/i);
    expect(text).not.toMatch(/guaranteed offline/i);
  });
});
