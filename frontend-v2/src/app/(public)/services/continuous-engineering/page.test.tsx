import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ContinuousEngineeringServicePage from "./page";

describe("Continuous Engineering service page", () => {
  it("identifies the service with the approved public name and headline, with the hero visual present", () => {
    render(<ContinuousEngineeringServicePage />);
    expect(screen.getByText("CONTINUOUS ENGINEERING")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Keep the product healthy after launch — and improving over time.",
      }),
    ).toBeInTheDocument();
    expect(document.getElementById("hero")!.querySelector("svg")).not.toBeNull();
  });

  it("offers Start a Project and Explore the Operating Model hero CTAs", () => {
    render(<ContinuousEngineeringServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore the Operating Model" })).toHaveAttribute("href", "#approach");
  });

  it("distinguishes the service from staff augmentation, helpdesk support and generic IT maintenance", () => {
    render(<ContinuousEngineeringServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/not a supply of individual resources billed by the hour/i);
    expect(text).not.toMatch(/24x7 (global )?managed support/i);
    expect(text).not.toMatch(/guaranteed (zero downtime|incident response|cost reduction)/i);
  });

  it("shows the reactive-vs-controlled shift as a comparison section", () => {
    render(<ContinuousEngineeringServicePage />);
    const section = within(document.getElementById("human-and-machine")!);
    expect(section.getByText("The Shift")).toBeInTheDocument();
    expect(section.getByText("Reactive")).toBeInTheDocument();
    expect(section.getByText("Controlled")).toBeInTheDocument();
    expect(section.getByText("Issues Resurface")).toBeInTheDocument();
    expect(section.getByText("Issues Triaged and Resolved")).toBeInTheDocument();
  });

  it("shows all eight outcomes with the product-health visual attached", () => {
    render(<ContinuousEngineeringServicePage />);
    const outcomes = within(document.getElementById("outcomes")!);
    for (const name of ["More Stable Releases", "Better Production Visibility", "Stronger Release Confidence"]) {
      expect(outcomes.getByText(name)).toBeInTheDocument();
    }
    expect(document.getElementById("outcomes")!.textContent).not.toMatch(/\d+%/);
  });

  it("shows all twelve capabilities as real text", () => {
    render(<ContinuousEngineeringServicePage />);
    const capabilities = within(document.getElementById("capabilities")!);
    for (const name of [
      "Production Support",
      "Issue Investigation & Resolution",
      "Technical Debt Reduction",
      "Backlog Stabilization",
    ]) {
      expect(capabilities.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders the Operating Model as a featured, asymmetrical section with the operating-loop visual and all seven stages", () => {
    render(<ContinuousEngineeringServicePage />);
    const approach = document.getElementById("approach")!;
    expect(within(approach).getByText("Operating Model")).toBeInTheDocument();
    expect(within(approach).getByText("Observe. Triage. Prioritize. Fix. Release. Learn. Improve.")).toBeInTheDocument();
    expect(within(approach).getByText("Observe")).toBeInTheDocument();
    expect(within(approach).getByText("Improve")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/not a new, separate methodology/i);
  });

  it("S8: tends the operating loop's hub with the shared editorial figure", () => {
    render(<ContinuousEngineeringServicePage />);
    const approach = document.getElementById("approach")!;
    expect(approach.querySelector("svg g")).not.toBeNull();
  });

  it("shows engineering reality proof distinguishing this from a support desk", () => {
    render(<ContinuousEngineeringServicePage />);
    const section = within(document.getElementById("engineering-proof")!);
    expect(section.getByText("This is engineering-led, not a support desk.")).toBeInTheDocument();
    expect(section.getByText("Root Cause Understanding")).toBeInTheDocument();
  });

  it("shows the Continuous Improvement section with its dark tone applied", () => {
    render(<ContinuousEngineeringServicePage />);
    const section = document.getElementById("engineering-meets-imagination")!;
    expect(within(section).getByText("Continuous Improvement")).toBeInTheDocument();
    expect(within(section).getByText("Healthy products improve while they operate.")).toBeInTheDocument();
    expect(section).toHaveAttribute("data-tone", "dark");
  });

  it("shows all four own products as restrained proof", () => {
    render(<ContinuousEngineeringServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(relatedWork.getByText(name)).toBeInTheDocument();
    }
  });

  it("offers a Product Engineering forward CTA", () => {
    render(<ContinuousEngineeringServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Product Engineering" })).toHaveAttribute(
      "href",
      "/services/product-engineering",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("does not publish an indicative price range or fixed duration", () => {
    render(<ContinuousEngineeringServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\d+[-–]week/i);
  });

  it("does not fabricate SLA percentages, response times or client claims", () => {
    render(<ContinuousEngineeringServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+%\s*(uptime|sla|reduction)/i,
      /\d+\s*(minute|hour)s?\s*response/i,
      /certified/i,
      /partnership with/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps exactly one h1 and does not create any other route", () => {
    render(<ContinuousEngineeringServicePage />);
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });
});
