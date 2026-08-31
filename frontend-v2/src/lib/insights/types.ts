/**
 * W3.5 — AROORAA Insights. Canonical, data-driven article model. Static
 * typed content (no MDX, no headless CMS — Phase 15) kept structured enough
 * that a future CMS could replace the source without rewriting the UI: a
 * `content`-shaped article stays an array of typed sections, never a single
 * opaque HTML/markdown blob.
 */

export type InsightCategory =
  | "PRODUCT_ENGINEERING"
  | "AI_AND_AUTOMATION"
  | "RESTAURANT_TECH"
  | "CONNECTED_PRODUCTS"
  | "SMART_HOME"
  | "ENGINEERING"
  | "FOUNDER_NOTES";

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  PRODUCT_ENGINEERING: "Product Engineering",
  AI_AND_AUTOMATION: "AI & Automation",
  RESTAURANT_TECH: "Restaurant Technology",
  CONNECTED_PRODUCTS: "Connected Products",
  SMART_HOME: "Smart Home",
  ENGINEERING: "Engineering",
  FOUNDER_NOTES: "Founder Notes",
};

/** Display order for the category filter — stable, not alphabetical. */
export const INSIGHT_CATEGORY_ORDER: InsightCategory[] = [
  "PRODUCT_ENGINEERING",
  "AI_AND_AUTOMATION",
  "RESTAURANT_TECH",
  "CONNECTED_PRODUCTS",
  "SMART_HOME",
  "ENGINEERING",
  "FOUNDER_NOTES",
];

/** One block of the article body — a paragraph run, optionally under its own H2. */
export interface InsightArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface InsightRelatedLink {
  label: string;
  href: string;
}

export interface InsightClosingCta {
  title: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface InsightArticle {
  slug: string;
  title: string;
  /** Short 1–2 sentence deck shown on cards and under the H1. */
  excerpt: string;
  category: InsightCategory;
  /** ISO date (YYYY-MM-DD) — only ever a real date this article was actually written. */
  publishedDate: string;
  updatedDate?: string;
  /** Exactly one article should be featured at a time on the index. */
  featured?: boolean;
  /** "AROORAA" or "AROORAA Team" unless a real, approved author is assigned — never a fabricated name. */
  authorLabel: string;
  seoTitle: string;
  seoDescription: string;
  content: InsightArticleSection[];
  /** Editorially relevant links out to products/services (Phase 13) — optional, never forced. */
  relatedProductLinks?: InsightRelatedLink[];
  /** Explicit override for related-insights; falls back to same-category derivation when absent. */
  relatedSlugs?: string[];
  closingCta: InsightClosingCta;
}
