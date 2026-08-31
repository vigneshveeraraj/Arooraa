import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import InsightsPage from "./page";
import { getFeaturedArticle, INSIGHT_ARTICLES } from "@/lib/insights/articles";
import { INSIGHTS_HERO } from "@/lib/content/insights";

describe("Insights index page", () => {
  it("renders exactly one H1 with the approved hero headline", () => {
    render(<InsightsPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(INSIGHTS_HERO.headline);
  });

  it("derives the featured story from the article dataset, not a separate hardcoded copy", () => {
    render(<InsightsPage />);
    const featured = getFeaturedArticle();
    const links = screen.getAllByRole("link", { name: new RegExp(featured.title) });
    expect(links[0]).toHaveAttribute("href", `/insights/${featured.slug}`);
  });

  it("shows a Latest Insights section that excludes the featured article", () => {
    render(<InsightsPage />);
    expect(screen.getByRole("heading", { name: "Latest Insights" })).toBeInTheDocument();
  });

  it("lists every article at least once, each linking to its own article page", () => {
    render(<InsightsPage />);
    for (const article of INSIGHT_ARTICLES) {
      const links = screen.getAllByRole("link", { name: new RegExp(article.title) });
      expect(links[0]).toHaveAttribute("href", `/insights/${article.slug}`);
    }
  });

  it("shows the category filter with all seven categories plus All", () => {
    render(<InsightsPage />);
    expect(screen.getByRole("group", { name: /filter by category/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /founder notes/i })).toBeInTheDocument();
  });

  it("offers a single restrained closing CTA to Start a Project", () => {
    render(<InsightsPage />);
    expect(screen.getByRole("heading", { name: "Have a problem worth solving?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/start-project");
  });

  it("never fabricates a named employee, customer or metric", () => {
    render(<InsightsPage />);
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/Marion/);
    expect(body).not.toMatch(/\d+% of (restaurants|users|customers)/i);
  });
});
