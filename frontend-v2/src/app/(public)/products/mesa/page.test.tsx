import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MesaProductPage from "./page";
import { MESA_PRODUCT_PAGE } from "@/lib/content/products";

describe("MESA product page", () => {
  it("identifies MESA as AROORAA's flagship product", () => {
    render(<MesaProductPage />);
    expect(screen.getByText("AROORAA FLAGSHIP PRODUCT")).toBeInTheDocument();
    expect(screen.getByText("Flagship product")).toBeInTheDocument();
  });

  it("uses the approved high-level positioning, not a POS/QR-menu framing", () => {
    render(<MesaProductPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "One restaurant. One connected experience." }),
    ).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/mesa is a pos\b/i);
    expect(text).not.toMatch(/mesa is just a qr menu/i);
  });

  it("offers a Request a Demo CTA pointing at an existing route", () => {
    render(<MesaProductPage />);
    const demoLinks = screen.getAllByRole("link", { name: "Request a Demo" });
    expect(demoLinks.length).toBeGreaterThan(0);
    for (const link of demoLinks) {
      expect(link).toHaveAttribute("href", "/start-project");
    }
  });

  it("shows customer-value sections", () => {
    render(<MesaProductPage />);
    expect(screen.getByText(MESA_PRODUCT_PAGE.theProblem!.title)).toBeInTheDocument();
    expect(screen.getByText(MESA_PRODUCT_PAGE.whatItDoes!.title)).toBeInTheDocument();
    expect(screen.getAllByText("Digital Dining").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kitchen Coordination").length).toBeGreaterThan(0);
  });

  it("uses honest maturity language for POS and Staff — in development, not available", () => {
    render(<MesaProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/active development/i);
    expect(text).not.toMatch(/mesa pos is available/i);
    expect(text).not.toMatch(/mesa staff is available/i);
  });

  it("does not claim current offline/resilience capability", () => {
    render(<MesaProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/works offline today/i);
    expect(text).not.toMatch(/offline mode is available/i);
    expect(text).toMatch(/long-term direction/i);
  });

  it("does not present AURA as a MESA module or feature", () => {
    render(<MesaProductPage />);
    expect(screen.queryByText(/\baura\b/i)).not.toBeInTheDocument();
  });

  it("does not publish fabricated metrics", () => {
    render(<MesaProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [/\d+%/, /\d+\+? restaurants/i, /\d+\+? customers/i, /\d+x faster/i, /uptime/i, /revenue/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not expose internal architecture or implementation detail", () => {
    render(<MesaProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /commerce core/i,
      /event-driven/i,
      /database/i,
      /idempoten/i,
      /synchroni[sz]ation/i,
      /conflict resolution/i,
      /service topology/i,
      /permission registry/i,
      /message topic/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("renders the P2.2 picture-story visuals alongside their sections", () => {
    render(<MesaProductPage />);
    expect(screen.getByText("Designed for")).toBeInTheDocument();
    expect(screen.getByText("Before MESA")).toBeInTheDocument();
    expect(screen.getByText("With MESA")).toBeInTheDocument();
    expect(screen.getAllByText("Digital Dining").length).toBeGreaterThan(0);
    expect(screen.getByText("Restaurant Team")).toBeInTheDocument();
    expect(screen.getByText("Core Foundation")).toBeInTheDocument();
    expect(screen.getByText("Active Development")).toBeInTheDocument();
    expect(screen.getByText("Long-Term Direction")).toBeInTheDocument();
  });

  it("keeps the approved section structure and CTA behavior after the visual polish", () => {
    render(<MesaProductPage />);
    for (const id of [
      "hero",
      "why-we-built-it",
      "the-problem",
      "product-vision",
      "what-it-does",
      "experience",
      "engineering",
      "where-were-going",
      "cta",
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
    expect(document.getElementById("how-it-works")).toBeNull();

    const startProjectLinks = screen.getAllByRole("link", { name: "Request a Demo" });
    expect(startProjectLinks.length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Talk to AROORAA" })).toHaveAttribute("href", "/contact");
  });
});
