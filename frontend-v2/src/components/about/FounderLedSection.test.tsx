import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FounderLedSection } from "./FounderLedSection";

describe("FounderLedSection", () => {
  it("renders the founder-led heading and belief statement", () => {
    render(<FounderLedSection />);
    expect(screen.getByRole("heading", { level: 2, name: "AROORAA is founder-led and product-led." })).toBeInTheDocument();
    expect(screen.getByText(/repeated frustration can be useful information/i)).toBeInTheDocument();
  });

  it("keeps founder context to public-safe categories only", () => {
    render(<FounderLedSection />);
    expect(screen.getByText("long-term software engineering experience")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/salary/i);
    expect(text).not.toMatch(/₹|\$\d/);
  });

  it("does not mention Marion anywhere", () => {
    render(<FounderLedSection />);
    expect(document.body.textContent ?? "").not.toMatch(/Marion/);
  });
});
