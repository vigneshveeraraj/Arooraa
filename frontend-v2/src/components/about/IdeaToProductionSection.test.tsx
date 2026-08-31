import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IdeaToProductionSection } from "./IdeaToProductionSection";

describe("IdeaToProductionSection", () => {
  it("renders the heading, entry points and the Explore Services CTA", () => {
    render(<IdeaToProductionSection />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We like ideas. We care even more about what it takes to make them real.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("an MVP")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Services" })).toHaveAttribute("href", "/services");
  });
});
