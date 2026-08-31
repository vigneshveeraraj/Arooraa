import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MesaEngineeringStoryPage from "./page";

describe("MESA Engineering Story page", () => {
  it("renders with exactly one h1 and the approved hero content", () => {
    render(<MesaEngineeringStoryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("One restaurant. Many moments. One connected experience.");
    expect(screen.getByText("AROORAA ENGINEERING STORY · MESA")).toBeInTheDocument();
    expect(screen.getAllByText("FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT").length).toBeGreaterThan(0);
  });

  it("offers the Explore MESA and Start a Project hero CTAs", () => {
    render(<MesaEngineeringStoryPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore MESA" })).toHaveAttribute("href", "/products/mesa");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("renders all fifteen story chapters with their approved headings, in order", () => {
    render(<MesaEngineeringStoryPage />);
    const ids = [
      "guest-vs-operations",
      "fragmentation",
      "table-orbit",
      "role-perspectives",
      "product-decisions",
      "meal-timeline",
      "engineering-sync",
      "edge-cases",
      "ux-operations",
      "ecosystem",
      "evolution",
      "what-we-didnt-build",
      "engineering-stack",
      "maturity",
      "proof",
    ];
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    let lastIndex = -1;
    for (const id of ids) {
      expect(document.getElementById(id)).not.toBeNull();
      const index = sectionEls.findIndex((el) => el.id === id);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it("W2.1.1: marks the opening chapter of each of the four narrative acts", () => {
    render(<MesaEngineeringStoryPage />);
    expect(within(document.getElementById("guest-vs-operations")!).getByText("ACT 1 — UNDERSTANDING THE RESTAURANT")).toBeInTheDocument();
    expect(within(document.getElementById("role-perspectives")!).getByText("ACT 2 — SHAPING THE PRODUCT")).toBeInTheDocument();
    expect(within(document.getElementById("engineering-sync")!).getByText("ACT 3 — ENGINEERING REALITY")).toBeInTheDocument();
    expect(within(document.getElementById("ecosystem")!).getByText("ACT 4 — EVOLVING THE ECOSYSTEM")).toBeInTheDocument();
    // no other chapter should carry an act marker
    for (const id of ["fragmentation", "table-orbit", "product-decisions", "meal-timeline"]) {
      expect(within(document.getElementById(id)!).queryByText(/^ACT \d/)).not.toBeInTheDocument();
    }
  });

  it("gives only the engineering-sync and evolution chapters a dark tone", () => {
    render(<MesaEngineeringStoryPage />);
    expect(document.getElementById("engineering-sync")).toHaveAttribute("data-tone", "dark");
    expect(document.getElementById("evolution")).toHaveAttribute("data-tone", "dark");
    for (const id of [
      "guest-vs-operations",
      "fragmentation",
      "table-orbit",
      "role-perspectives",
      "product-decisions",
      "meal-timeline",
      "edge-cases",
      "ux-operations",
      "ecosystem",
      "what-we-didnt-build",
      "engineering-stack",
      "maturity",
      "proof",
    ]) {
      expect(document.getElementById(id)).toHaveAttribute("data-tone", "light");
    }
  });

  it("keeps the table-experience layer's mobile-first grouping and the guest-vs-operations split, fragmentation before/after intact", () => {
    render(<MesaEngineeringStoryPage />);
    const orbit = within(document.getElementById("table-orbit")!);
    expect(orbit.getByText("At the Table")).toBeInTheDocument();
    expect(orbit.getByText("Around the Table")).toBeInTheDocument();
    for (const item of ["Scan the table QR", "Mobile Menu", "Order", "Play While Waiting", "Call Waiter", "Service", "Kitchen", "Billing"]) {
      expect(orbit.getAllByText(item).length).toBeGreaterThan(0);
    }
    const guestVsOps = within(document.getElementById("guest-vs-operations")!);
    expect(guestVsOps.getByText("Scan")).toBeInTheDocument();
    expect(guestVsOps.getByText("Operations")).toBeInTheDocument();
  });

  it("W2.1.2B: makes the mobile-first MESA guest journey unmistakable across the hero, table experience and meal timeline", () => {
    render(<MesaEngineeringStoryPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByText("Scan QR")).toBeInTheDocument();
    expect(hero.getByText("Call Waiter")).toBeInTheDocument();

    const timeline = within(document.getElementById("meal-timeline")!);
    expect(timeline.getByText("Scan")).toBeInTheDocument();
    expect(timeline.getByText("Wait & Engage")).toBeInTheDocument();

    expect(screen.getAllByText("Digital when convenient. Human when needed.")).toHaveLength(1);
  });

  it("W2.1.2D: places the MESA ecosystem visual once, between Chapter 04 and Chapter 05, without disturbing either chapter", () => {
    render(<MesaEngineeringStoryPage />);
    expect(screen.getAllByText("MESA ECOSYSTEM")).toHaveLength(1);
    expect(document.querySelectorAll("#mesa-ecosystem")).toHaveLength(1);

    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("section"));
    const rolePerspectivesIndex = sectionEls.findIndex((el) => el.id === "role-perspectives");
    const ecosystemIndex = sectionEls.findIndex((el) => el.id === "mesa-ecosystem");
    const productDecisionsIndex = sectionEls.findIndex((el) => el.id === "product-decisions");
    expect(rolePerspectivesIndex).toBeLessThan(ecosystemIndex);
    expect(ecosystemIndex).toBeLessThan(productDecisionsIndex);

    // Chapter 04 and Chapter 05 still carry their own approved content, untouched
    const rolePerspectives = within(document.getElementById("role-perspectives")!);
    expect(rolePerspectives.getByRole("heading", { level: 2, name: "A restaurant product serves different people at the same time." })).toBeInTheDocument();
    const productDecisions = within(document.getElementById("product-decisions")!);
    expect(productDecisions.getByRole("heading", { level: 2, name: "The product became clearer through a series of decisions." })).toBeInTheDocument();
  });

  it("states maturity honestly with no fabricated launch scale or usage data", () => {
    render(<MesaEngineeringStoryPage />);
    const maturity = within(document.getElementById("maturity")!);
    expect(maturity.getByText(/being built, tested and strengthened progressively/)).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\d+\+?\s*(restaurants|customers|locations)/i);
    expect(text).not.toMatch(/\$\d/);
    expect(text).not.toMatch(/\d+%\s*(uptime|growth|roi)/i);
  });

  it("does not expose confidential implementation terminology", () => {
    render(<MesaEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const term of ["redis", "kafka", "postgres", "microservice", "repository", "endpoint", "database schema"]) {
      expect(text.toLowerCase()).not.toContain(term);
    }
  });

  it("does not fabricate clients, testimonials or results, and never mentions Marion", () => {
    render(<MesaEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    for (const pattern of [/trusted by/i, /testimonial/i, /case stud/i, /certified by/i, /award/i, /Marion/]) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("renders the closing proof statement and the final CTA with related links", () => {
    render(<MesaEngineeringStoryPage />);
    const proof = within(document.getElementById("proof")!);
    expect(proof.getByText(/MESA is not simply a restaurant product/)).toBeInTheDocument();

    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("heading", { name: "Have a workflow this complex that should feel much simpler?" })).toBeInTheDocument();
    // "Start a Project" and "Explore MESA" each appear twice here by design —
    // once as the primary/secondary CTA action, once in the related-links row.
    for (const link of cta.getAllByRole("link", { name: "Start a Project" })) {
      expect(link).toHaveAttribute("href", "/start-project");
    }
    expect(cta.getAllByRole("link", { name: "Explore MESA" }).length).toBeGreaterThan(0);
    expect(cta.getByRole("link", { name: "Product Engineering" })).toHaveAttribute("href", "/services/product-engineering");
    expect(cta.getByRole("link", { name: "Continuous Engineering" })).toHaveAttribute("href", "/services/continuous-engineering");
  });

  it("does not publish an indicative price range", () => {
    render(<MesaEngineeringStoryPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
  });
});
