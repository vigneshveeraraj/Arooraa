import { describe, expect, it } from "vitest";
import {
  getAllArticles,
  getAllSlugs,
  getArticleBySlug,
  getArticlesByCategory,
  getFeaturedArticle,
  getLatestArticles,
  getRelatedArticles,
  INSIGHT_ARTICLES,
} from "./articles";
import { countWords } from "./reading-time";
import { INSIGHT_CATEGORY_ORDER } from "./types";

describe("insights article dataset", () => {
  it("has unique slugs", () => {
    expect(new Set(getAllSlugs()).size).toBe(INSIGHT_ARTICLES.length);
  });

  it("contains exactly seven initial articles (Phase 5)", () => {
    expect(getAllArticles()).toHaveLength(7);
  });

  it("only ever uses the seven canonical categories", () => {
    for (const article of INSIGHT_ARTICLES) {
      expect(INSIGHT_CATEGORY_ORDER).toContain(article.category);
    }
  });

  it("has exactly one featured article", () => {
    expect(INSIGHT_ARTICLES.filter((article) => article.featured).length).toBe(1);
  });

  it("getFeaturedArticle returns the flagged article", () => {
    const featured = getFeaturedArticle();
    expect(featured.featured).toBe(true);
  });

  it("getLatestArticles excludes the featured article", () => {
    const featured = getFeaturedArticle();
    const latest = getLatestArticles();
    expect(latest.find((article) => article.slug === featured.slug)).toBeUndefined();
  });

  it("getArticleBySlug finds a real article and returns undefined for an unknown slug", () => {
    const first = INSIGHT_ARTICLES[0]!;
    expect(getArticleBySlug(first.slug)?.title).toBe(first.title);
    expect(getArticleBySlug("no-such-article")).toBeUndefined();
  });

  it("getArticlesByCategory only returns articles in that category", () => {
    for (const category of INSIGHT_CATEGORY_ORDER) {
      for (const article of getArticlesByCategory(category)) {
        expect(article.category).toBe(category);
      }
    }
  });

  it("getRelatedArticles never includes the current article", () => {
    for (const article of INSIGHT_ARTICLES) {
      const related = getRelatedArticles(article.slug);
      expect(related.find((r) => r.slug === article.slug)).toBeUndefined();
    }
  });

  it("getRelatedArticles returns real related stories for every article", () => {
    for (const article of INSIGHT_ARTICLES) {
      expect(getRelatedArticles(article.slug).length).toBeGreaterThan(0);
    }
  });

  it("returns an empty list for an unknown slug", () => {
    expect(getRelatedArticles("no-such-article")).toEqual([]);
  });

  it("never fabricates a named author — only AROORAA or AROORAA Team", () => {
    for (const article of INSIGHT_ARTICLES) {
      expect(["AROORAA", "AROORAA Team"]).toContain(article.authorLabel);
    }
  });

  it("only uses genuine, current publish dates — never a fabricated staggered history", () => {
    for (const article of INSIGHT_ARTICLES) {
      expect(article.publishedDate).toBe("2026-08-30");
      expect(article.updatedDate).toBeUndefined();
    }
  });

  it("meets the quality bar — each article is a substantial, deliberate piece, not thin SEO filler", () => {
    for (const article of INSIGHT_ARTICLES) {
      const words = countWords(article.content);
      expect(words).toBeGreaterThanOrEqual(700);
      expect(words).toBeLessThanOrEqual(1700);
    }
  });

  it("every article has a non-empty SEO title and description, distinct per article", () => {
    const seoTitles = new Set(INSIGHT_ARTICLES.map((a) => a.seoTitle));
    const seoDescriptions = new Set(INSIGHT_ARTICLES.map((a) => a.seoDescription));
    expect(seoTitles.size).toBe(INSIGHT_ARTICLES.length);
    expect(seoDescriptions.size).toBe(INSIGHT_ARTICLES.length);
  });

  it("never exposes Marion among referenced products", () => {
    const body = INSIGHT_ARTICLES.flatMap((a) => a.content.flatMap((s) => s.paragraphs)).join(" ");
    expect(body).not.toMatch(/Marion/);
  });

  it("never claims a fabricated statistic, market figure or customer quote", () => {
    const body = INSIGHT_ARTICLES.flatMap((a) => a.content.flatMap((s) => s.paragraphs)).join(" ");
    expect(body).not.toMatch(/\d+% of (restaurants|users|customers|homes)/i);
    expect(body).not.toMatch(/according to (a|our) (survey|study|report)/i);
    expect(body).not.toMatch(/in today's digital world/i);
  });

  it("describes Smart Mirror and Arooraa Smart Home only as concept/prototype work, never deployed customer proof", () => {
    const smartHomeArticle = getArticleBySlug("why-smart-homes-should-work-without-internet")!;
    const connectedProductsArticle = getArticleBySlug("building-connected-physical-products")!;
    const smartHomeBody = smartHomeArticle.content.flatMap((s) => s.paragraphs).join(" ");
    const connectedBody = connectedProductsArticle.content.flatMap((s) => s.paragraphs).join(" ");
    expect(smartHomeBody).toMatch(/prototype/i);
    expect(connectedBody).toMatch(/prototype/i);
  });
});
