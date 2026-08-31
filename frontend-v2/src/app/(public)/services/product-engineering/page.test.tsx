import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ProductEngineeringServicePage from "./page";

describe("Product Engineering service page", () => {
  it("identifies the service with the approved public name and headline", () => {
    render(<ProductEngineeringServicePage />);
    expect(screen.getByText("PRODUCT ENGINEERING")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "From product direction to production-ready software." }),
    ).toBeInTheDocument();
  });

  it("offers Start a Project and Explore How We Build hero CTAs", () => {
    render(<ProductEngineeringServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore How We Build" })).toHaveAttribute("href", "#approach");
  });

  it("S8: shows the Business Problem as a featured picture-story section with the team-assembly visual", () => {
    render(<ProductEngineeringServicePage />);
    const businessProblem = document.getElementById("business-problem")!;
    expect(within(businessProblem).getByText("Shipping software is not the same as engineering a product.")).toBeInTheDocument();
    expect(businessProblem.querySelector("svg")).not.toBeNull();
    expect(businessProblem.querySelectorAll("g")).toHaveLength(2);
  });

  it("shows Outcomes with the product-assembly visual attached", () => {
    render(<ProductEngineeringServicePage />);
    const outcomes = within(document.getElementById("outcomes")!);
    expect(outcomes.getByText("What good product engineering should create")).toBeInTheDocument();
    expect(outcomes.getByText("Clear Product Architecture")).toBeInTheDocument();
    expect(document.getElementById("outcomes")!.querySelector("svg")).not.toBeNull();
  });

  it("shows all nine capabilities as real text", () => {
    render(<ProductEngineeringServicePage />);
    const capabilities = within(document.getElementById("capabilities")!);
    for (const name of [
      "Product Architecture",
      "Backend Engineering",
      "Frontend Engineering",
      "Mobile Engineering",
      "Data Engineering",
      "Integration Engineering",
      "Security by Design",
      "Quality Engineering",
      "Cloud & Delivery",
    ]) {
      expect(capabilities.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows the Approach as a subset of the shared delivery lifecycle, not a separate methodology", () => {
    render(<ProductEngineeringServicePage />);
    const approach = within(document.getElementById("approach")!);
    expect(approach.getByText("Build the product as a system, not a pile of features.")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/service-specific subset of AROORAA's own delivery lifecycle/i);
    expect(text).toMatch(/not a separate methodology/i);
  });

  it("shows the Human + Engineering collaboration section with its own visual", () => {
    render(<ProductEngineeringServicePage />);
    const collaboration = within(document.getElementById("human-and-machine")!);
    expect(collaboration.getByText("Product Thinking")).toBeInTheDocument();
    expect(collaboration.getByText("Engineering")).toBeInTheDocument();
    expect(document.getElementById("human-and-machine")!.querySelector("svg")).not.toBeNull();
  });

  it("shows AROORAA's own products as restrained proof", () => {
    render(<ProductEngineeringServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(relatedWork.getByText(name)).toBeInTheDocument();
    }
  });

  it("offers a Product Strategy & Discovery backlink from the closing CTA", () => {
    render(<ProductEngineeringServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Product Strategy & Discovery" })).toHaveAttribute(
      "href",
      "/services/product-discovery",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("does not publish an indicative price range or fixed duration", () => {
    render(<ProductEngineeringServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\d+[-–]week/i);
  });

  it("does not fabricate client projects, delivery metrics or testimonials", () => {
    render(<ProductEngineeringServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+\+?\s*(clients|projects|customers)/i,
      /success rate/i,
      /guaranteed timeline/i,
      /case stud/i,
      /certified/i,
      /partnership with/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not position the service as staff augmentation or a commodity resourcing model", () => {
    render(<ProductEngineeringServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/rather than supplying individual resources as a commodity service/i);
    expect(text).not.toMatch(/dedicated developers on demand/i);
    expect(text).not.toMatch(/hire our engineers/i);
  });

  it("keeps the approved section structure, in order, and does not create any other service route", () => {
    render(<ProductEngineeringServicePage />);
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    const ids = [
      "hero",
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "outcomes",
      "capabilities",
      "human-and-machine",
      "approach",
      "engineering-proof",
      "related-work",
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
    for (const id of ["ai-boundaries", "agentic-ai", "data-and-context", "example-use-cases", "transformation"]) {
      expect(document.getElementById(id)).toBeNull();
    }
  });
});
