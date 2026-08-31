import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { WorkDetailHero } from "./WorkDetailHero";

describe("WorkDetailHero", () => {
  it("renders eyebrow, headline, supporting copy, maturity badge and both CTAs", () => {
    render(
      <WorkDetailHero
        eyebrow="TEST EYEBROW"
        title="Test headline."
        supporting="Test supporting copy."
        maturityLabel="TEST STATUS"
        primaryCta={{ label: "Primary Action", href: "/primary" }}
        secondaryCta={{ label: "Secondary Action", href: "/secondary" }}
        visual={<div data-testid="fake-visual" />}
      />,
    );
    expect(screen.getByText("TEST EYEBROW")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Test headline." })).toBeInTheDocument();
    expect(screen.getByText("Test supporting copy.")).toBeInTheDocument();
    expect(screen.getByText("TEST STATUS")).toBeInTheDocument();
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Primary Action" })).toHaveAttribute("href", "/primary");
    expect(hero.getByRole("link", { name: "Secondary Action" })).toHaveAttribute("href", "/secondary");
    expect(hero.getByTestId("fake-visual")).toBeInTheDocument();
  });

  it("W2.1.2: still renders correctly when an optional wide visualWeight is supplied", () => {
    render(
      <WorkDetailHero
        eyebrow="TEST EYEBROW"
        title="Test headline."
        supporting="Test supporting copy."
        maturityLabel="TEST STATUS"
        primaryCta={{ label: "Primary Action", href: "/primary" }}
        secondaryCta={{ label: "Secondary Action", href: "/secondary" }}
        visual={<div data-testid="fake-visual" />}
        visualWeight="wide"
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Test headline." })).toBeInTheDocument();
    expect(screen.getByTestId("fake-visual")).toBeInTheDocument();
  });
});
