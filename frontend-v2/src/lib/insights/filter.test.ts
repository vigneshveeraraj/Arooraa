import { describe, expect, it } from "vitest";
import { filterArticlesByCategory, formatArticleCount } from "./filter";
import type { InsightArticle } from "./types";

function fixture(category: InsightArticle["category"], slug: string): InsightArticle {
  return {
    slug,
    title: slug,
    excerpt: "excerpt",
    category,
    publishedDate: "2026-08-30",
    authorLabel: "AROORAA Team",
    seoTitle: "seo",
    seoDescription: "seo",
    content: [{ paragraphs: ["one two three"] }],
    closingCta: { title: "t", ctaLabel: "c", ctaHref: "/x" },
  };
}

const ARTICLES = [
  fixture("SMART_HOME", "a"),
  fixture("ENGINEERING", "b"),
  fixture("SMART_HOME", "c"),
];

describe("filterArticlesByCategory", () => {
  it("returns every article for ALL", () => {
    expect(filterArticlesByCategory(ARTICLES, "ALL")).toHaveLength(3);
  });

  it("returns only articles in the given category", () => {
    const result = filterArticlesByCategory(ARTICLES, "SMART_HOME");
    expect(result.map((a) => a.slug).sort()).toEqual(["a", "c"]);
  });

  it("returns an empty list for a category with no matches", () => {
    expect(filterArticlesByCategory(ARTICLES, "FOUNDER_NOTES")).toEqual([]);
  });
});

describe("formatArticleCount", () => {
  it("formats zero, one and many distinctly", () => {
    expect(formatArticleCount(0)).toBe("No articles");
    expect(formatArticleCount(1)).toBe("1 article");
    expect(formatArticleCount(5)).toBe("5 articles");
  });
});
