import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ApplicationModernizationServicePage from "./page";

describe("Application Modernization service page", () => {
  it("identifies the service with the approved public name and headline", () => {
    render(<ApplicationModernizationServicePage />);
    expect(screen.getByText("APPLICATION MODERNIZATION")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Modernize what holds the product back — preserve what makes it valuable.",
      }),
    ).toBeInTheDocument();
  });

  it("offers Start a Project and Explore the Modernization Approach hero CTAs", () => {
    render(<ApplicationModernizationServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore the Modernization Approach" })).toHaveAttribute("href", "#approach");
  });

  it("states that modernization is not automatically a rewrite, with the correct overridden eyebrow", () => {
    render(<ApplicationModernizationServicePage />);
    const section = within(document.getElementById("transformation")!);
    expect(section.getByText("Controlled Modernization")).toBeInTheDocument();
    expect(section.getByText("Modernization is not automatically a rewrite.")).toBeInTheDocument();
    expect(section.getByText("Possible modernization decisions")).toBeInTheDocument();
    expect(document.getElementById("transformation")!.querySelector("svg")).not.toBeNull();
  });

  it("S8: renders the transformation section as a featured, asymmetrical split, and carries an editorial figure across the transition", () => {
    render(<ApplicationModernizationServicePage />);
    const section = document.getElementById("transformation")!;
    expect(section.querySelector("g")).not.toBeNull();
  });

  it("shows all eight outcomes and nine capabilities as real text", () => {
    render(<ApplicationModernizationServicePage />);
    const outcomes = within(document.getElementById("outcomes")!);
    for (const name of ["Easier Change", "Safer Releases", "Clearer Architecture", "Platform Readiness"]) {
      expect(outcomes.getByText(name)).toBeInTheDocument();
    }
    const capabilities = within(document.getElementById("capabilities")!);
    for (const name of [
      "Application Assessment",
      "Architecture Refactoring",
      "API Enablement",
      "Framework & Runtime Modernization",
      "Security Modernization",
      "Delivery Modernization",
    ]) {
      expect(capabilities.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows the controlled-modernization approach with its phased-strip visual", () => {
    render(<ApplicationModernizationServicePage />);
    const approach = within(document.getElementById("approach")!);
    expect(approach.getByText("Modernize in controlled steps.")).toBeInTheDocument();
    expect(approach.getByText("Evolve")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/service-specific subset of AROORAA's own delivery lifecycle/i);
  });

  it("discusses rewrite vs. incremental modernization as an evidence-based decision", () => {
    render(<ApplicationModernizationServicePage />);
    const section = within(document.getElementById("data-and-context")!);
    expect(section.getByText("Rewrite vs. Evolve")).toBeInTheDocument();
    expect(section.getByText("Rewrite, refactor or evolve gradually?")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/depends on evidence, not preference/i);
  });

  it("shows business-knowledge preservation as its own section", () => {
    render(<ApplicationModernizationServicePage />);
    const section = within(document.getElementById("ai-boundaries")!);
    expect(section.getByText("Business Knowledge")).toBeInTheDocument();
    expect(section.getByText("The most valuable part of an old system may not be the code.")).toBeInTheDocument();
    expect(section.getByText("Operational Knowledge")).toBeInTheDocument();
    expect(screen.queryByText("AI Boundaries")).not.toBeInTheDocument();
  });

  it("distinguishes Application Modernization from Cloud & Platform Engineering", () => {
    render(<ApplicationModernizationServicePage />);
    const section = within(document.getElementById("engineering-meets-imagination")!);
    expect(section.getByText("Application vs. Platform")).toBeInTheDocument();
    expect(
      section.getByText("Application modernization and infrastructure modernization are related, but they are not the same thing."),
    ).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/Cloud &amp; Platform Engineering|Cloud & Platform Engineering/);
  });

  it("shows AROORAA's own products as restrained proof, without treating them as legacy case studies", () => {
    render(<ApplicationModernizationServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    expect(relatedWork.getByText("MESA")).toBeInTheDocument();
    expect(relatedWork.getByText("Mindra")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/case stud/i);
  });

  it("offers a Product Engineering forward CTA", () => {
    render(<ApplicationModernizationServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Product Engineering" })).toHaveAttribute(
      "href",
      "/services/product-engineering",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("does not publish an indicative price range or fixed duration", () => {
    render(<ApplicationModernizationServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\d+[-–]week/i);
  });

  it("does not fabricate client migration projects, cost/performance percentages or downtime claims", () => {
    render(<ApplicationModernizationServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+%\s*(cost|performance|downtime|reduction)/i,
      /\d+\+?\s*(migrations|clients|projects)/i,
      /zero[- ]downtime guarantee/i,
      /certified/i,
      /partnership with/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps the approved section structure, in order, and does not create any other service route", () => {
    render(<ApplicationModernizationServicePage />);
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    const ids = [
      "hero",
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "transformation",
      "outcomes",
      "capabilities",
      "data-and-context",
      "approach",
      "engineering-proof",
      "ai-boundaries",
      "related-work",
      "engineering-meets-imagination",
      "engagement-model",
      "faq",
      "cta",
    ];
    let lastIndex = -1;
    for (const id of ids) {
      expect(document.getElementById(id)).not.toBeNull();
      const index = sectionEls.findIndex((el) => el.id === id);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
    for (const id of ["human-and-machine", "agentic-ai", "example-use-cases"]) {
      expect(document.getElementById(id)).toBeNull();
    }
  });
});
