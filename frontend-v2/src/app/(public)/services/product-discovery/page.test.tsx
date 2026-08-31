import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ProductDiscoveryServicePage from "./page";

describe("Product Strategy & Discovery service page", () => {
  it("identifies the service with the approved public name", () => {
    render(<ProductDiscoveryServicePage />);
    expect(screen.getByText("PRODUCT STRATEGY & DISCOVERY")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Turn an idea into a product direction worth building." }),
    ).toBeInTheDocument();
  });

  it("offers Start a Project and See the Discovery Approach hero CTAs", () => {
    render(<ProductDiscoveryServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "See the Discovery Approach" })).toHaveAttribute("href", "#approach");
  });

  it("covers MVP scope, prioritization and technical feasibility as real text", () => {
    render(<ProductDiscoveryServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/MVP Scope/);
    expect(text).toMatch(/MVP Scoping/);
    expect(text).toMatch(/Technical Feasibility/);
    expect(text).toMatch(/Prioritized Capabilities/);
  });

  it("shows the Outcomes section with the scope-funnel visual", () => {
    render(<ProductDiscoveryServicePage />);
    const outcomes = within(document.getElementById("outcomes")!);
    expect(outcomes.getByText("What you should leave discovery with")).toBeInTheDocument();
    expect(outcomes.getByText("Defined Product Problem")).toBeInTheDocument();
    expect(outcomes.getByText("Everything we could build")).toBeInTheDocument();
  });

  it("shows the Discovery Approach as a subset of the shared delivery lifecycle", () => {
    render(<ProductDiscoveryServicePage />);
    const approach = within(document.getElementById("approach")!);
    expect(approach.getByText("Understand first. Define before building.")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/service-specific subset of AROORAA's own delivery lifecycle/i);
    expect(text).not.toMatch(/unrelated consulting methodology/i);
  });

  it("offers a Product Engineering forward CTA, consistent with the site's forward-link pattern", () => {
    render(<ProductDiscoveryServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Product Engineering" })).toHaveAttribute(
      "href",
      "/services/product-engineering",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("shows AROORAA's own products as restrained proof, without repeating full product-page copy", () => {
    render(<ProductDiscoveryServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(relatedWork.getByText(name)).toBeInTheDocument();
    }
  });

  it("does not publish an indicative price range", () => {
    render(<ProductDiscoveryServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
  });

  it("does not fabricate client projects, workshop counts or testimonials", () => {
    render(<ProductDiscoveryServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+\+?\s*(clients|projects|workshops)/i,
      /success rate/i,
      /guaranteed timeline/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not promise guaranteed timelines or a perfect final specification", () => {
    render(<ProductDiscoveryServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/guaranteed timeline/i);
    expect(text).not.toMatch(/perfect specification/i);
  });

  it("S8: shows the Business Problem as a featured picture-story section with the new direction visual", () => {
    render(<ProductDiscoveryServicePage />);
    const businessProblem = document.getElementById("business-problem")!;
    expect(within(businessProblem).getByText("Good engineering cannot rescue an unclear product direction.")).toBeInTheDocument();
    expect(businessProblem.querySelector("svg")).not.toBeNull();
    expect(businessProblem.querySelector("g")).not.toBeNull();
  });

  it("keeps the approved section structure", () => {
    render(<ProductDiscoveryServicePage />);
    for (const id of [
      "hero",
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "outcomes",
      "capabilities",
      "approach",
      "engineering-proof",
      "related-work",
      "engagement-model",
      "faq",
      "cta",
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });
});
