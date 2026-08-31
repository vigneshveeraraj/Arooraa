import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedWork } from "./FeaturedWork";
import { MESA_FEATURE, SUPPORTING_WORK } from "@/lib/content/work";

describe("FeaturedWork", () => {
  it('uses "Built by AROORAA" as the section heading', () => {
    render(<FeaturedWork />);
    expect(screen.getByRole("heading", { name: "Built by AROORAA" })).toBeInTheDocument();
  });

  it("features MESA as the primary proof with the correct route", () => {
    render(<FeaturedWork />);
    expect(screen.getByRole("heading", { name: "MESA" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore MESA/ })).toHaveAttribute("href", MESA_FEATURE.cta.href);
  });

  it("shows Mindra and Smart Mirror as supporting work with correct routes", () => {
    render(<FeaturedWork />);
    for (const item of SUPPORTING_WORK) {
      expect(screen.getByRole("heading", { name: item.name })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(`Explore ${item.name}`) })).toHaveAttribute(
        "href",
        item.href,
      );
    }
    expect(screen.getByRole("heading", { name: "Smart Mirror" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "M²" })).not.toBeInTheDocument();
  });

  it("does not require Arooraa Smart Home as engineering proof yet", () => {
    render(<FeaturedWork />);
    expect(screen.queryByText("Arooraa Smart Home")).not.toBeInTheDocument();
    expect(screen.queryByText("Smart Home EB")).not.toBeInTheDocument();
  });

  it("does not use fabricated outcome metrics", () => {
    render(<FeaturedWork />);
    const text = document.body.textContent ?? "";
    const disallowed = [/\d+%/, /\d+\+? restaurants/i, /\d+\+? customers/i, /\d+x faster/i, /uptime/i, /revenue/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not give Marion a fabricated case-study treatment", () => {
    render(<FeaturedWork />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/marion/i);
  });
});
