import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutHero } from "./AboutHero";

describe("AboutHero", () => {
  it("renders the approved h1 headline and both CTAs", () => {
    render(<AboutHero />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "We build because we believe better products begin with better questions.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveAttribute("href", "/our-work");
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("carries no maturity badge — About is not a product story", () => {
    render(<AboutHero />);
    expect(screen.queryByText(/prototype|concept|mvp|flagship/i)).not.toBeInTheDocument();
  });
});
