import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Hero } from "./Hero";
import { HERO_CONTENT } from "@/lib/content/home";

describe("Hero", () => {
  it("shows the frozen eyebrow", () => {
    render(<Hero />);
    expect(screen.getByText(HERO_CONTENT.eyebrow)).toBeInTheDocument();
  });

  it("shows the approved primary positioning as the h1", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: HERO_CONTENT.headline })).toBeInTheDocument();
  });

  it("links Start a Project to /start-project", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: HERO_CONTENT.primaryCta.label })).toHaveAttribute(
      "href",
      HERO_CONTENT.primaryCta.href,
    );
  });

  it("links Explore Our Products to /products", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: HERO_CONTENT.secondaryCta.label })).toHaveAttribute(
      "href",
      HERO_CONTENT.secondaryCta.href,
    );
  });

  it("makes MESA, Mindra, Smart Mirror and Arooraa Smart Home discoverable as real accessible text", () => {
    render(<Hero />);
    const strip = screen.getByTestId("hero-product-strip");
    for (const label of HERO_CONTENT.productLabels) {
      expect(within(strip).getByText(label)).toBeInTheDocument();
    }
    expect(within(strip).queryByText("Smart Home EB")).not.toBeInTheDocument();
  });

  it("keeps the decorative product-node visual hidden from assistive tech", () => {
    render(<Hero />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
