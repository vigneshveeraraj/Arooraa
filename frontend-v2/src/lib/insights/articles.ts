import type { InsightArticle, InsightCategory } from "./types";
import { whySmartHomesShouldWorkWithoutInternet } from "./content/why-smart-homes-should-work-without-internet";
import { restaurantTechnologyWorksBetterConnected } from "./content/restaurant-technology-works-better-connected";
import { secondBrainShouldReduceWork } from "./content/second-brain-should-reduce-work";
import { aiIsUsefulWhenItImprovesTheProduct } from "./content/ai-is-useful-when-it-improves-the-product";
import { repeatedFrustrationIsOftenAProductSignal } from "./content/repeated-frustration-is-often-a-product-signal";
import { goodProductsRemoveComplexity } from "./content/good-products-remove-complexity";
import { buildingConnectedPhysicalProducts } from "./content/building-connected-physical-products";

/**
 * W3.5 — the single source of truth for every Insights article. Document
 * order also doubles as the "latest first" order (every article currently
 * shares the same genuine publish date — Phase 4/7 forbid fabricating a
 * staggered publication history just to make the index look busier).
 */
export const INSIGHT_ARTICLES: InsightArticle[] = [
  repeatedFrustrationIsOftenAProductSignal,
  aiIsUsefulWhenItImprovesTheProduct,
  restaurantTechnologyWorksBetterConnected,
  secondBrainShouldReduceWork,
  whySmartHomesShouldWorkWithoutInternet,
  goodProductsRemoveComplexity,
  buildingConnectedPhysicalProducts,
];

export function getAllArticles(): InsightArticle[] {
  return INSIGHT_ARTICLES;
}

export function getAllSlugs(): string[] {
  return INSIGHT_ARTICLES.map((article) => article.slug);
}

export function getArticleBySlug(slug: string): InsightArticle | undefined {
  return INSIGHT_ARTICLES.find((article) => article.slug === slug);
}

/** Falls back to the first article by document order if none is explicitly flagged featured. */
export function getFeaturedArticle(): InsightArticle {
  return INSIGHT_ARTICLES.find((article) => article.featured) ?? INSIGHT_ARTICLES[0]!;
}

/** The rest of the "latest" rail — recent articles excluding whichever one is featured. */
export function getLatestArticles(limit = 3): InsightArticle[] {
  const featured = getFeaturedArticle();
  return INSIGHT_ARTICLES.filter((article) => article.slug !== featured.slug).slice(0, limit);
}

export function getArticlesByCategory(category: InsightCategory): InsightArticle[] {
  return INSIGHT_ARTICLES.filter((article) => article.category === category);
}

/**
 * Related insights (Phase 12): an explicit `relatedSlugs` list wins when an
 * article defines one; otherwise derive from same-category articles. The
 * current article is always excluded from its own related list.
 */
export function getRelatedArticles(currentSlug: string, limit = 3): InsightArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return [];

  if (current.relatedSlugs && current.relatedSlugs.length > 0) {
    return current.relatedSlugs
      .map((slug) => getArticleBySlug(slug))
      .filter((article): article is InsightArticle => Boolean(article) && article!.slug !== currentSlug)
      .slice(0, limit);
  }

  return INSIGHT_ARTICLES.filter((article) => article.slug !== currentSlug && article.category === current.category).slice(
    0,
    limit,
  );
}
