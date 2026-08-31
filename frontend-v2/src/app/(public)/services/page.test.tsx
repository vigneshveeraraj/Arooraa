import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ServicesPage from "./page";
import { SERVICE_GROUPS } from "@/lib/content/services";

describe("Services Index page", () => {
  it("renders with the approved hero", () => {
    render(<ServicesPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "From idea to production — and beyond." }),
    ).toBeInTheDocument();
    expect(screen.getByText("SERVICES")).toBeInTheDocument();
  });

  it("shows exactly the six frozen service groups, no seventh invented service", () => {
    render(<ServicesPage />);
    expect(SERVICE_GROUPS).toHaveLength(6);
    const names = [
      "Product Strategy & Discovery",
      "Product Engineering",
      "AI, Data & Automation",
      "Application Modernization",
      "Cloud & Platform Engineering",
      "Continuous Engineering",
    ];
    expect(SERVICE_GROUPS.map((service) => service.name)).toEqual(names);
    for (const name of names) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("does not split UX/UI, QA or Security into top-level services", () => {
    render(<ServicesPage />);
    const names = SERVICE_GROUPS.map((service) => service.name);
    expect(names).not.toContain("UX/UI");
    expect(names).not.toContain("Quality Assurance");
    expect(names).not.toContain("Security");
  });

  it("shows UX/UI, Quality Engineering and Security by Design as cross-cutting capabilities", () => {
    render(<ServicesPage />);
    const section = within(document.getElementById("cross-cutting-capabilities")!);
    expect(section.getByText("UX / UI")).toBeInTheDocument();
    expect(section.getByText("Quality Engineering")).toBeInTheDocument();
    expect(section.getByText("Security by Design")).toBeInTheDocument();
  });

  it("does not create routes for the cross-cutting capabilities", () => {
    render(<ServicesPage />);
    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).not.toContain("/services/ux-ui");
    expect(links).not.toContain("/services/quality-engineering");
    expect(links).not.toContain("/services/security");
  });

  it("shows the problem-led section with real business scenarios routed to service groups", () => {
    render(<ServicesPage />);
    const section = within(document.getElementById("start-with-the-problem")!);
    expect(section.getByText("What are you trying to solve?")).toBeInTheDocument();
    expect(section.getByText("I have an idea but don't know where to start.")).toBeInTheDocument();
    expect(section.getByText("We need to build a product or MVP.")).toBeInTheDocument();
    expect(section.getByText("We already launched, but need engineering support.")).toBeInTheDocument();
    expect(section.getAllByRole("link", { name: /Product Strategy & Discovery/ }).length).toBeGreaterThan(0);
  });

  it("shows AROORAA's own products as restrained engineering proof", () => {
    render(<ServicesPage />);
    const section = within(document.getElementById("product-engineering-proof")!);
    expect(section.getByText("We build products ourselves.")).toBeInTheDocument();
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(section.getByText(name)).toBeInTheDocument();
    }
  });

  it("does not mention Marion anywhere on the Services Index", () => {
    render(<ServicesPage />);
    expect(screen.queryByText("Marion")).not.toBeInTheDocument();
  });

  it("shows the shared How We Work journey without inventing a new process model", () => {
    render(<ServicesPage />);
    const section = within(document.getElementById("how-we-work")!);
    for (const stage of ["Understand", "Discover", "Define", "Design", "Build", "Validate", "Launch", "Operate", "Evolve"]) {
      expect(section.getByText(stage)).toBeInTheDocument();
    }
  });

  it("shows engagement models without fixed pricing or Bronze/Silver/Gold packaging", () => {
    render(<ServicesPage />);
    const section = within(document.getElementById("engagement-models")!);
    expect(section.getByText("Discovery Sprint")).toBeInTheDocument();
    expect(section.getByText("Build Engagement")).toBeInTheDocument();
    expect(section.getByText("Modernization Engagement")).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/bronze/i);
    expect(text).not.toMatch(/silver/i);
    expect(text).not.toMatch(/\bgold\b/i);
    expect(text).not.toMatch(/₹\d/);
    expect(text).not.toMatch(/\$\d/);
  });

  it("offers a Start a Project CTA and does not add quote/assessment forms", () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole("link", { name: "Start a Project" }).length).toBeGreaterThan(0);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/request a quote/i);
    expect(text).not.toMatch(/book a discovery call/i);
    expect(text).not.toMatch(/book discovery/i);
  });

  it("does not fabricate client logos, testimonials or metrics", () => {
    render(<ServicesPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+\+?\s*(clients|projects|customers)/i,
      /years in business/i,
      /certified partner/i,
      /(iso|soc)\s*\d/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });
});
