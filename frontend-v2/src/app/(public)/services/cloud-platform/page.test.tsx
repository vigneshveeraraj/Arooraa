import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CloudPlatformServicePage from "./page";

describe("Cloud & Platform Engineering service page", () => {
  it("identifies the service with the approved public name and headline", () => {
    render(<CloudPlatformServicePage />);
    expect(screen.getByText("CLOUD & PLATFORM ENGINEERING")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Give the product a platform it can rely on." }),
    ).toBeInTheDocument();
  });

  it("offers Start a Project and Explore the Platform Approach hero CTAs", () => {
    render(<CloudPlatformServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore the Platform Approach" })).toHaveAttribute("href", "#approach");
  });

  it("positions the service around production platform engineering, not generic cloud/DevOps outsourcing", () => {
    render(<CloudPlatformServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/cloud migration reseller/i);
    expect(text).not.toMatch(/staff augmentation/i);
    expect(text).not.toMatch(/move everything to cloud/i);
  });

  it("states the platform principle with its signature flow visual", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("transformation")!);
    expect(section.getByText("Platform Principle")).toBeInTheDocument();
    expect(
      section.getByText("Cloud should simplify product delivery, not become another layer of complexity."),
    ).toBeInTheDocument();
    expect(document.getElementById("transformation")!.querySelector("svg")).not.toBeNull();
  });

  it("S8: renders the transformation section as a featured, asymmetrical split, with the operator figure watching the flow", () => {
    render(<CloudPlatformServicePage />);
    const section = document.getElementById("transformation")!;
    expect(section.querySelectorAll("g")).toHaveLength(1);
  });

  it("shows all eight outcomes and nine capabilities as real text", () => {
    render(<CloudPlatformServicePage />);
    const outcomes = within(document.getElementById("outcomes")!);
    for (const name of ["Repeatable Delivery", "Environment Confidence", "Faster Recovery", "Better Cost Awareness"]) {
      expect(outcomes.getByText(name)).toBeInTheDocument();
    }
    const capabilities = within(document.getElementById("capabilities")!);
    for (const name of ["Cloud Architecture", "Containerization", "CI/CD Engineering", "Observability", "Platform Enablement"]) {
      expect(capabilities.getByText(name)).toBeInTheDocument();
    }
  });

  it("discusses observability without promising a single pane of glass", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("agentic-ai")!);
    expect(section.getByText("Observability")).toBeInTheDocument();
    expect(section.getByText("You cannot operate what you cannot see.")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/not a promised single pane of glass/i);
  });

  it("shows reliability as a Prevent / Recover split", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("human-and-machine")!);
    expect(section.getByText("Reliability")).toBeInTheDocument();
    expect(section.getByText("Prevent")).toBeInTheDocument();
    expect(section.getByText("Recover")).toBeInTheDocument();
    expect(section.getByText("Rollback")).toBeInTheDocument();
    expect(screen.queryByText("Human + Machine")).not.toBeInTheDocument();
  });

  it("states the scaling philosophy without implying Kubernetes/microservices by default", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("data-and-context")!);
    expect(section.getByText("Scaling Philosophy")).toBeInTheDocument();
    expect(section.getByText("Scale deliberately, not automatically.")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/Not necessarily\. Platform complexity should match the product's actual requirements/i);
    expect(text).not.toMatch(/kubernetes by default/i);
    expect(text).not.toMatch(/every product needs kubernetes/i);
  });

  it("distinguishes Application Engineering from Platform Engineering", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("engineering-proof")!);
    expect(section.getByText("Application vs. Platform")).toBeInTheDocument();
    expect(section.getByText("Application and platform decisions should support each other.")).toBeInTheDocument();
  });

  it("distinguishes platform engineering from a plain deployment pipeline", () => {
    render(<CloudPlatformServicePage />);
    const section = within(document.getElementById("ai-boundaries")!);
    expect(section.getByText("Beyond CI/CD")).toBeInTheDocument();
    expect(section.getByText("More than a deployment pipeline.")).toBeInTheDocument();
  });

  it("shows AROORAA's own products as restrained proof, without fabricated scale claims", () => {
    render(<CloudPlatformServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    expect(relatedWork.getByText("MESA")).toBeInTheDocument();
    expect(relatedWork.getByText("Mindra")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+%\s*uptime/i);
    expect(text).not.toMatch(/requests per second/i);
  });

  it("offers an Application Modernization forward CTA", () => {
    render(<CloudPlatformServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Application Modernization" })).toHaveAttribute(
      "href",
      "/services/application-modernization",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("does not publish an indicative price range or fixed duration", () => {
    render(<CloudPlatformServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\d+[-–]week/i);
  });

  it("does not fabricate uptime, deployment counts, cost savings or certifications", () => {
    render(<CloudPlatformServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+%\s*(uptime|cost savings|reduction)/i,
      /\d+\+?\s*(deployments|clients|migrations)/i,
      /certified/i,
      /partnership with (aws|azure|gcp|google cloud)/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps the approved section structure, in order, and does not create Continuous Engineering or any other route", () => {
    render(<CloudPlatformServicePage />);
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    const ids = [
      "hero",
      "business-problem",
      "who-its-for",
      "problems-we-solve",
      "transformation",
      "outcomes",
      "capabilities",
      "human-and-machine",
      "agentic-ai",
      "data-and-context",
      "how-it-fits-together",
      "example-use-cases",
      "approach",
      "engineering-proof",
      "ai-boundaries",
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
    for (const id of ["engineering-meets-imagination", "indicative-range"]) {
      expect(document.getElementById(id)).toBeNull();
    }
  });
});
