import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleDetailLayout } from "./ArticleDetailLayout";
import { getRelatedArticles, INSIGHT_ARTICLES } from "@/lib/insights/articles";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/insights/types";

describe("ArticleDetailLayout", () => {
  it.each(INSIGHT_ARTICLES)("renders $slug with one H1, its category, excerpt and every content section", (article) => {
    render(<ArticleDetailLayout article={article} />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(article.title);

    expect(screen.getAllByText(INSIGHT_CATEGORY_LABELS[article.category]).length).toBeGreaterThan(0);
    expect(screen.getByText(article.excerpt)).toBeInTheDocument();

    for (const section of article.content) {
      if (section.heading) {
        expect(screen.getByRole("heading", { level: 2, name: section.heading })).toBeInTheDocument();
      }
      for (const paragraph of section.paragraphs) {
        expect(screen.getByText(paragraph)).toBeInTheDocument();
      }
    }
  });

  it("shows the article's own closing CTA", () => {
    const article = INSIGHT_ARTICLES[0]!;
    render(<ArticleDetailLayout article={article} />);
    expect(screen.getByRole("heading", { name: article.closingCta.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: article.closingCta.ctaLabel })).toHaveAttribute(
      "href",
      article.closingCta.ctaHref,
    );
  });

  it("shows related insights that never include the current article", () => {
    const article = INSIGHT_ARTICLES[0]!;
    render(<ArticleDetailLayout article={article} />);

    const related = getRelatedArticles(article.slug);
    expect(related.length).toBeGreaterThan(0);
    for (const relatedArticle of related) {
      expect(screen.getAllByText(relatedArticle.title).length).toBeGreaterThan(0);
    }
    // The current article's own title appears once, in the H1 — never a second time inside Related Insights.
    expect(screen.getAllByText(article.title)).toHaveLength(1);
  });

  it("shows a breadcrumb back to the Insights index", () => {
    render(<ArticleDetailLayout article={INSIGHT_ARTICLES[0]!} />);
    expect(screen.getByRole("link", { name: /insights/i })).toHaveAttribute("href", "/insights");
  });

  it("shows the reading time and published date semantically", () => {
    const article = INSIGHT_ARTICLES[0]!;
    render(<ArticleDetailLayout article={article} />);
    const time = document.querySelector(`time[datetime="${article.publishedDate}"]`);
    expect(time).not.toBeNull();
  });
});
