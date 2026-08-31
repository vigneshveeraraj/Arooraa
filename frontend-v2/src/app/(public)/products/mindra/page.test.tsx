import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MindraProductPage from "./page";
import { MINDRA_PRODUCT_PAGE } from "@/lib/content/products";

describe("Mindra product page", () => {
  it("identifies Mindra as a personal and family second brain", () => {
    render(<MindraProductPage />);
    expect(screen.getByText("AROORAA PRODUCT")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Remember less. Live with more clarity." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/individuals and families keep important information, tasks, groceries/i),
    ).toBeInTheDocument();
  });

  it("does not claim available AI-assistant functionality in the hero", () => {
    render(<MindraProductPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.queryByText(/ai assistant/i)).not.toBeInTheDocument();
  });

  it("offers Explore Mindra and Start a Project hero CTAs", () => {
    render(<MindraProductPage />);
    const hero = within(document.getElementById("hero")!);
    expect(hero.getByRole("link", { name: "Explore Mindra" })).toHaveAttribute("href", "#what-it-does");
    expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("presents the My Space / Family Space concept clearly", () => {
    render(<MindraProductPage />);
    expect(screen.getByText("Private when it should be. Shared when it needs to be.")).toBeInTheDocument();
    expect(screen.getAllByText("My Space").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Family Space").length).toBeGreaterThan(0);
    expect(screen.getByText("Personal information stays private to you.")).toBeInTheDocument();
    expect(
      screen.getByText("Shared household information is visible only to your trusted household."),
    ).toBeInTheDocument();
    expect(screen.getByText("shared deliberately")).toBeInTheDocument();
  });

  it("shows the seven approved current capability areas", () => {
    render(<MindraProductPage />);
    for (const item of MINDRA_PRODUCT_PAGE.whatItDoes!.items) {
      expect(screen.getAllByText(item.name).length).toBeGreaterThan(0);
    }
  });

  it("presents voice and richer capture as future exploration, not current capability", () => {
    render(<MindraProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/exploring faster ways to capture information/i);
    expect(text).not.toMatch(/hi mindra is available/i);
    expect(text).not.toMatch(/wake word is available/i);
    expect(text).not.toMatch(/voice assistant is complete/i);
    expect(text).not.toMatch(/always-listening/i);
  });

  it("does not make unsupported generative-AI claims", () => {
    render(<MindraProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/powered by ai/i);
    expect(text).not.toMatch(/ai-powered/i);
    expect(text).not.toMatch(/artificial intelligence assistant/i);
  });

  it("shows public-safe privacy and trust points", () => {
    render(<MindraProductPage />);
    expect(screen.getByText("Personal information should stay personal.")).toBeInTheDocument();
    expect(screen.getByText("Authenticated Access")).toBeInTheDocument();
    expect(screen.getByText("Household-Scoped Sharing")).toBeInTheDocument();
  });

  it("does not expose internal implementation detail", () => {
    render(<MindraProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [
      /database schema/i,
      /household id/i,
      /user id/i,
      /refresh[- ]token/i,
      /bcrypt/i,
      /jwt/i,
      /authorization guard/i,
      /object storage/i,
      /hosting provider/i,
      /wake[- ]word engineering/i,
      /samsung/i,
      /test count/i,
      /version \d/i,
    ];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("does not publish fabricated metrics", () => {
    render(<MindraProductPage />);
    const text = document.body.textContent ?? "";
    const disallowed = [/\d+%/, /\d+\+? families/i, /\d+\+? users/i, /\d+x faster/i, /best family app/i];
    for (const pattern of disallowed) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("offers a Start a Project closing CTA, not a demo-request CTA", () => {
    render(<MindraProductPage />);
    const cta = within(document.getElementById("cta")!);
    expect(cta.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
    expect(cta.getByRole("link", { name: "Explore Our Products" })).toHaveAttribute("href", "/products");
    expect(cta.queryByText(/request a demo/i)).not.toBeInTheDocument();
  });

  it("keeps the approved section structure", () => {
    render(<MindraProductPage />);
    for (const id of [
      "hero",
      "why-we-built-it",
      "the-problem",
      "product-vision",
      "what-it-does",
      "how-it-works",
      "experience",
      "privacy-trust",
      "engineering",
      "where-were-going",
      "cta",
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it("renders the Mindra-specific picture-story visuals", () => {
    render(<MindraProductPage />);
    expect(screen.getByText("Scattered")).toBeInTheDocument();
    expect(screen.getByText("One calm place")).toBeInTheDocument();
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("During the Day")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
  });

  it("renders the phone-glimpse companion visuals in their sections", () => {
    render(<MindraProductPage />);
    // Product Vision
    expect(screen.getByText("Organized")).toBeInTheDocument();
    // My Space / Family Space
    expect(screen.getByText("Private reminder")).toBeInTheDocument();
    expect(screen.getByText("Shared shopping")).toBeInTheDocument();
    // Privacy & Trust
    expect(screen.getByText("Personal notes stay private")).toBeInTheDocument();
  });

  it("renders the signature Mindra Life Dashboard as the What Mindra Does companion visual", () => {
    render(<MindraProductPage />);
    const section = within(document.getElementById("what-it-does")!);
    expect(section.getByText("Mindra Today")).toBeInTheDocument();
    expect(section.getByText("Today's Plan")).toBeInTheDocument();
    expect(section.getByText("Family Tasks")).toBeInTheDocument();
    expect(section.getAllByText("Groceries").length).toBeGreaterThan(0);
    expect(section.getByText("Meal Plan")).toBeInTheDocument();
    expect(section.getByText("My Space")).toBeInTheDocument();
    expect(section.getByText("3 of 6")).toBeInTheDocument();
  });

  it("keeps every phone-glimpse and dashboard mockup free of real device chrome", () => {
    render(<MindraProductPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/9:41/);
    expect(text).not.toMatch(/battery/i);
  });
});
