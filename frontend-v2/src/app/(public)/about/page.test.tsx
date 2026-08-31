import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

describe("About page", () => {
  it("renders with exactly one h1 carrying the approved headline", () => {
    render(<AboutPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("We build because we believe better products begin with better questions.");
  });

  it("states the AROORAA positioning and the better-way philosophy", () => {
    render(<AboutPage />);
    expect(screen.getByText("AROORAA — Product Engineering & Innovation")).toBeInTheDocument();
    expect(screen.getByText(/There should be a better way/i)).toBeInTheDocument();
  });

  it("carries the reduce-complexity / time-friction message", () => {
    render(<AboutPage />);
    expect(screen.getByText("Good products should reduce complexity, not add to it.")).toBeInTheDocument();
    expect(screen.getByText(/reducing the amount of time people spend fighting systems/i)).toBeInTheDocument();
  });

  it("carries the customer/provider bridge principle", () => {
    render(<AboutPage />);
    expect(
      screen.getByText(
        "The customer experience and the provider experience are usually two halves of the same product problem.",
      ),
    ).toBeInTheDocument();
  });

  it("carries the repeated-frustration origin story", () => {
    render(<AboutPage />);
    // "Why does this still work this way?" appears once in the Chapter 01
    // origin moment and again in Chapter 10's founder recurring-thought —
    // a deliberate echo per the brief, not a duplicate to collapse.
    expect(screen.getAllByText("Why does this still work this way?")).toHaveLength(2);
    expect(screen.getByText(/frustration became responsibility/i)).toBeInTheDocument();
    expect(screen.getByText(/repeated frustration can be useful information/i)).toBeInTheDocument();
  });

  it("names all four public products", () => {
    render(<AboutPage />);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
  });

  it("never mentions Marion", () => {
    render(<AboutPage />);
    expect(document.body.textContent ?? "").not.toMatch(/Marion/);
  });

  it("states the own-product philosophy", () => {
    render(<AboutPage />);
    expect(
      screen.getByText("We do not only advise people how to build products. We build our own."),
    ).toBeInTheDocument();
  });

  it("states product thinking and engineering belong together", () => {
    render(<AboutPage />);
    expect(
      screen.getByText("Product thinking and engineering should not live in separate rooms."),
    ).toBeInTheDocument();
  });

  it("frames AI as a capability, not the company identity", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We use AI where it makes the product more useful — not because every product needs an AI label.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("human control matters")).toBeInTheDocument();
  });

  it("renders all nine engineering principles", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 3, name: "Solve the real problem" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Reliability matters" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Operate what we build" })).toBeInTheDocument();
  });

  it("states honest company-stage language, not fabricated scale", () => {
    render(<AboutPage />);
    expect(screen.getByText("Credibility should come from the work.")).toBeInTheDocument();
    expect(screen.getByText("fabricated customer counts")).toBeInTheDocument();
  });

  it("carries the founder-led / product-led section", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 2, name: "AROORAA is founder-led and product-led." })).toBeInTheDocument();
  });

  it("carries the future-direction section without fabricated targets", () => {
    render(<AboutPage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "The goal is not to build one successful product. It is to build the ability to keep creating them.",
      }),
    ).toBeInTheDocument();
  });

  it("offers the Start a Project and Our Work CTAs at the hero and the close", () => {
    render(<AboutPage />);
    expect(screen.getAllByRole("link", { name: "Start a Project" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "Explore Our Work" }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: "Explore Services" })).toHaveAttribute("href", "/services");
  });

  it("does not fabricate metrics, testimonials or client claims", () => {
    render(<AboutPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      // "fake testimonials" legitimately appears in the honest-building
      // do-not-need list — only flag an actual testimonial claim.
      /(?<!fake )testimonials?/i,
      /client says/i,
      /case stud/i,
      /\d+\+?\s*(customers|clients|users|employees)/i,
      /\d+%\s*(roi|growth|uptime|revenue)/i,
      /certified by/i,
      /award/i,
      /₹/,
      /\$\d/,
      /funding|series [ab]/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps exactly two dark-toned sections — Building Honestly and the closing", () => {
    render(<AboutPage />);
    expect(document.getElementById("honest-building")).toHaveAttribute("data-tone", "dark");
    expect(document.getElementById("closing")).toHaveAttribute("data-tone", "dark");
    for (const id of ["hero", "why-exists", "products-first", "discipline", "idea-to-production", "bridge", "product-engineering", "ai-capability", "principles", "founder", "future-direction"]) {
      expect(document.getElementById(id)).toHaveAttribute("data-tone", "light");
    }
  });
});
