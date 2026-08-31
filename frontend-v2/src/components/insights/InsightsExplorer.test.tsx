import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsightsExplorer } from "./InsightsExplorer";
import { INSIGHT_ARTICLES } from "@/lib/insights/articles";
import type { InsightArticle } from "@/lib/insights/types";

function fixture(category: InsightArticle["category"], slug: string, title: string): InsightArticle {
  return {
    slug,
    title,
    excerpt: "excerpt",
    category,
    publishedDate: "2026-08-30",
    authorLabel: "AROORAA Team",
    seoTitle: "seo",
    seoDescription: "seo",
    content: [{ paragraphs: ["one two three four five six seven eight nine ten"] }],
    closingCta: { title: "t", ctaLabel: "c", ctaHref: "/x" },
  };
}

const FIXTURE_ARTICLES: InsightArticle[] = [
  fixture("SMART_HOME", "smart-home-piece", "Smart Home Piece"),
  fixture("ENGINEERING", "engineering-piece", "Engineering Piece"),
];

describe("InsightsExplorer", () => {
  it("shows every real article with the dynamically computed count", () => {
    render(<InsightsExplorer />);
    expect(screen.getByText(`${INSIGHT_ARTICLES.length} articles`)).toBeInTheDocument();
    for (const article of INSIGHT_ARTICLES) {
      expect(screen.getByText(article.title)).toBeInTheDocument();
    }
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    render(<InsightsExplorer articles={FIXTURE_ARTICLES} />);

    await user.click(screen.getByRole("button", { name: /smart home \(1\)/i }));

    expect(screen.getByText("1 article")).toBeInTheDocument();
    expect(screen.getByText("Smart Home Piece")).toBeInTheDocument();
    expect(screen.queryByText("Engineering Piece")).not.toBeInTheDocument();
  });

  it("derives category counts from the dataset", () => {
    render(<InsightsExplorer articles={FIXTURE_ARTICLES} />);
    expect(screen.getByRole("button", { name: /smart home \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /engineering \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /founder notes \(0\)/i })).toBeInTheDocument();
  });

  it("shows an accessible empty state when a category has no articles, with a way back to All", async () => {
    const user = userEvent.setup();
    render(<InsightsExplorer articles={FIXTURE_ARTICLES} />);

    await user.click(screen.getByRole("button", { name: /founder notes \(0\)/i }));

    expect(screen.getByText("No articles in this category yet.")).toBeInTheDocument();
    const clearButton = screen.getByRole("button", { name: /show all articles/i });

    await user.click(clearButton);
    expect(screen.getByText("2 articles")).toBeInTheDocument();
  });

  it("marks the active filter with aria-pressed for keyboard/AT users", async () => {
    const user = userEvent.setup();
    render(<InsightsExplorer articles={FIXTURE_ARTICLES} />);

    const allButton = screen.getByRole("button", { name: /all \(2\)/i });
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    const smartHomeButton = screen.getByRole("button", { name: /smart home \(1\)/i });
    await user.click(smartHomeButton);
    expect(smartHomeButton).toHaveAttribute("aria-pressed", "true");
    expect(allButton).toHaveAttribute("aria-pressed", "false");
  });
});
