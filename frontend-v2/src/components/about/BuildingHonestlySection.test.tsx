import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuildingHonestlySection } from "./BuildingHonestlySection";

describe("BuildingHonestlySection", () => {
  it("renders the honest-building heading and credibility line", () => {
    render(<BuildingHonestlySection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We would rather show thoughtful work than manufacture the appearance of scale.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Credibility should come from the work.")).toBeInTheDocument();
  });

  it("lists what AROORAA does not need — no fabricated metrics implied as real", () => {
    render(<BuildingHonestlySection />);
    expect(screen.getByText("fabricated customer counts")).toBeInTheDocument();
    expect(screen.getByText("fake testimonials")).toBeInTheDocument();
  });

  it("is the dark-toned section", () => {
    render(<BuildingHonestlySection />);
    expect(document.getElementById("honest-building")).toHaveAttribute("data-tone", "dark");
  });
});
