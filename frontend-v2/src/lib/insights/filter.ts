import type { InsightArticle, InsightCategory } from "./types";

export type InsightCategoryFilter = InsightCategory | "ALL";

/**
 * Pure client-side filter over the (small, static) article dataset — the
 * same reasoning as Careers' filterJobs: a handful of articles doesn't
 * warrant a search backend (Phase 9 explicitly makes search optional).
 */
export function filterArticlesByCategory(articles: InsightArticle[], category: InsightCategoryFilter): InsightArticle[] {
  if (category === "ALL") return articles;
  return articles.filter((article) => article.category === category);
}

export function formatArticleCount(count: number): string {
  if (count === 0) return "No articles";
  if (count === 1) return "1 article";
  return `${count} articles`;
}
