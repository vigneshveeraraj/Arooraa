import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OwnProductProofSection } from "./OwnProductProofSection";

describe("OwnProductProofSection", () => {
  it("names exactly the four public products and links to Our Work", () => {
    render(<OwnProductProofSection />);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveAttribute("href", "/our-work");
  });

  it("does not mention Marion", () => {
    render(<OwnProductProofSection />);
    expect(document.body.textContent ?? "").not.toMatch(/Marion/);
  });

  it("stays restrained — not styled as a full Our Work index page", () => {
    render(<OwnProductProofSection />);
    expect(screen.queryAllByRole("heading").length).toBe(0);
  });
});
