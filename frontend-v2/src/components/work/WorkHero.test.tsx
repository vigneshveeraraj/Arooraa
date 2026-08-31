import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { WorkHero } from "./WorkHero";

describe("WorkHero", () => {
  it("renders the approved eyebrow, headline and supporting copy", () => {
    render(<WorkHero />);
    expect(screen.getByText("OUR WORK")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Products built from real problems." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/AROORAA builds its own products across software, AI, mobile/)).toBeInTheDocument();
    expect(screen.getByText("This is where our engineering philosophy becomes something tangible.")).toBeInTheDocument();
  });

  it("offers Explore the Work (anchor) and Start a Project hero CTAs", () => {
    render(<WorkHero />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore the Work" })).toHaveAttribute("href", "#mesa");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("renders the project constellation visual", () => {
    render(<WorkHero />);
    expect(document.getElementById("hero")!.querySelector("svg")).not.toBeNull();
  });
});
