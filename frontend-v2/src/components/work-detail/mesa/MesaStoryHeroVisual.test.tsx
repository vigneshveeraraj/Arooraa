import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesaStoryHeroVisual } from "./MesaStoryHeroVisual";

describe("MesaStoryHeroVisual", () => {
  it("renders the connected-restaurant concept photo with descriptive alt text, loaded eagerly", () => {
    render(<MesaStoryHeroVisual />);
    const img = screen.getByRole("img", { name: /guests, service staff, kitchen and billing/i });
    expect(img).toHaveAttribute("src", "/images/work/mesa/story/hero.webp");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("W2.1.2B: renders the mobile-first MESA guest journey as real, visible text", () => {
    render(<MesaStoryHeroVisual />);
    for (const label of ["Scan QR", "Browse Menu", "Order", "Call Waiter", "Service", "Bill"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("or Play While Waiting")).toBeInTheDocument();
  });

  it("renders a brief visible caption naming the image as a concept illustration", () => {
    render(<MesaStoryHeroVisual />);
    expect(screen.getByText(/concept illustration/i)).toBeInTheDocument();
  });
});
