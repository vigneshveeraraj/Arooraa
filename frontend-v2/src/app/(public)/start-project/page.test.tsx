import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StartProjectPage, { metadata } from "./page";

describe("Start Project page", () => {
  it("renders with exactly one h1 carrying the approved headline", () => {
    render(<StartProjectPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Tell us what should work better.");
  });

  it("renders the What Happens Next reassurance section", () => {
    render(<StartProjectPage />);
    expect(screen.getByRole("heading", { level: 2, name: "What happens next?" })).toBeInTheDocument();
  });

  it("renders the start-with marketing proof section", () => {
    render(<StartProjectPage />);
    expect(screen.getByRole("heading", { level: 2, name: "You can start with…" })).toBeInTheDocument();
  });

  it("renders the guided form, defaulting to Step 1 — Direction", () => {
    render(<StartProjectPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Choose the direction" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").length).toBeGreaterThanOrEqual(15); // 8 solution + 7 engagement
  });

  it("renders the restrained own-product proof band with the Our Work CTA", () => {
    render(<StartProjectPage />);
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveAttribute("href", "/our-work");
  });

  it("never mentions Marion", () => {
    render(<StartProjectPage />);
    expect(document.body.textContent ?? "").not.toMatch(/Marion/);
  });

  it("does not promise a fast/guaranteed response time anywhere on the page", () => {
    render(<StartProjectPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/within (5|15|30) minutes/i);
    expect(text).not.toMatch(/24\/7/i);
    expect(text).not.toMatch(/same[- ]day/i);
    expect(text).not.toMatch(/guaranteed response/i);
  });

  it("does not use fabricated client/testimonial/success-metric language", () => {
    render(<StartProjectPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/trusted by/i);
    expect(text).not.toMatch(/testimonial/i);
    expect(text).not.toMatch(/\d+\+?\s*(customers|clients|users)/i);
    expect(text).not.toMatch(/\d+%\s*(roi|growth|uptime|satisfaction)/i);
  });

  it("does not use aggressive sales patterns — no countdown or scarcity language", () => {
    render(<StartProjectPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/slots? left/i);
    expect(text).not.toMatch(/only \d+/i);
    expect(text).not.toMatch(/limited time/i);
  });

  it("does not show a fabricated production reference number on initial render", () => {
    render(<StartProjectPage />);
    expect(document.body.textContent ?? "").not.toMatch(/ARP-\d+/);
  });

  it("uses restrained SEO metadata and keeps the lead form out of the search index", () => {
    expect(metadata.title).toBe("Start a Project | AROORAA");
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(String(metadata.description)).not.toMatch(/\$\d|₹\d/);
  });
});
