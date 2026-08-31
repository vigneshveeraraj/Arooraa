import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AiAutomationServicePage from "./page";

describe("AI, Data & Automation service page", () => {
  it("identifies the service with the approved public name and headline", () => {
    render(<AiAutomationServicePage />);
    expect(screen.getByText("AI, DATA & AUTOMATION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Make intelligence useful." })).toBeInTheDocument();
  });

  it("does not use the disallowed alternate service names", () => {
    render(<AiAutomationServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/AI Consulting/);
    expect(text).not.toMatch(/Generative AI Services/);
    expect(text).not.toMatch(/AI Transformation/);
    expect(text).not.toMatch(/Automation Agency/);
  });

  it("offers Start a Project and Explore the Approach hero CTAs, with the hero visual present", () => {
    render(<AiAutomationServicePage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(hero.getByRole("link", { name: "Explore the Approach" })).toHaveAttribute("href", "#approach");
    expect(document.getElementById("hero")!.querySelector("svg")).not.toBeNull();
  });

  it("states that automation without AI is sometimes the right answer", () => {
    render(<AiAutomationServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/Sometimes the right answer is automation without AI\./);
  });

  it("shows the Human + Machine collaboration section with both sides", () => {
    render(<AiAutomationServicePage />);
    const collaboration = within(document.getElementById("human-and-machine")!);
    expect(collaboration.getByText("Machine")).toBeInTheDocument();
    expect(collaboration.getByText("Human")).toBeInTheDocument();
    expect(collaboration.getByText("Automate")).toBeInTheDocument();
    expect(collaboration.getByText("Own Outcomes")).toBeInTheDocument();
  });

  it("treats agentic AI carefully — controlled framing present, autonomy overclaims absent", () => {
    render(<AiAutomationServicePage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/clear boundaries, observability and human intervention/);
    expect(text).not.toMatch(/fully autonomous/i);
    expect(text).not.toMatch(/unsupervised financial/i);
    expect(text).not.toMatch(/unlimited tool access/i);
  });

  it("shows AI Boundaries / safety principles as real text", () => {
    render(<AiAutomationServicePage />);
    const safety = within(document.getElementById("ai-boundaries")!);
    expect(safety.getByText("Useful AI needs boundaries.")).toBeInTheDocument();
    expect(safety.getByText("Avoid Fabricated Certainty")).toBeInTheDocument();
  });

  it("labels practical examples as illustrative, not delivered client work", () => {
    render(<AiAutomationServicePage />);
    const examples = within(document.getElementById("example-use-cases")!);
    expect(examples.getByText("Knowledge Assistant")).toBeInTheDocument();
    expect(examples.getByText(/Illustrative examples/)).toBeInTheDocument();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/trusted by/i);
  });

  it("shows the robotic-innovation editorial section with its own visual, in its S8 dark-tone band", () => {
    render(<AiAutomationServicePage />);
    const innovationEl = document.getElementById("engineering-meets-imagination")!;
    const innovation = within(innovationEl);
    expect(innovation.getByText("Where engineering meets imagination.")).toBeInTheDocument();
    expect(innovationEl.querySelector("svg")).not.toBeNull();
    expect(innovationEl).toHaveAttribute("data-tone", "dark");
  });

  it("S8.2: shows the hero intelligence-scene visual with its editorial figure, and the Human+Machine visual using the same shared figure", () => {
    render(<AiAutomationServicePage />);
    expect(document.getElementById("hero")!.querySelector("g")).not.toBeNull();
    expect(document.getElementById("human-and-machine")!.querySelector("g")).not.toBeNull();
  });

  it("S8: renders The Shift (transformation) as a featured, asymmetrical section", () => {
    render(<AiAutomationServicePage />);
    const transformation = document.getElementById("transformation")!;
    expect(within(transformation).getByText("From repetitive work to intelligent flow.")).toBeInTheDocument();
    expect(transformation.querySelector("ol")).not.toBeNull();
  });

  it("offers a Product Engineering forward CTA, consistent with the site's forward-link pattern", () => {
    render(<AiAutomationServicePage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Explore Product Engineering" })).toHaveAttribute(
      "href",
      "/services/product-engineering",
    );
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("shows AROORAA's own products as restrained proof, without inventing completed AI capabilities", () => {
    render(<AiAutomationServicePage />);
    const relatedWork = within(document.getElementById("related-work")!);
    for (const name of ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"]) {
      expect(relatedWork.getByText(name)).toBeInTheDocument();
    }
  });

  it("does not publish an indicative price range", () => {
    render(<AiAutomationServicePage />);
    expect(document.getElementById("indicative-range")).toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/₹/);
    expect(text).not.toMatch(/\$\d/);
  });

  it("does not fabricate client deployments, ROI, accuracy or adoption claims", () => {
    render(<AiAutomationServicePage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /trusted by/i,
      /testimonial/i,
      /\d+%\s*(accuracy|roi|faster|reduction)/i,
      /\d+\+?\s*(clients|customers|deployments)/i,
      /hours saved/i,
      /certified/i,
      /partnership with/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps the full approved section structure, in order", () => {
    render(<AiAutomationServicePage />);
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
      "engineering-meets-imagination",
      "engagement-model",
      "faq",
      "cta",
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
});
