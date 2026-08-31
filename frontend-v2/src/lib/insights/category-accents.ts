import type { InsightCategory } from "./types";

export interface CategoryAccent {
  color: string;
  background: string;
}

/**
 * One restrained accent per category (Phase 11: "restrained AROORAA
 * branding", no stock photography). Drawn from the same palette family as
 * Careers' FAMILY_ACCENTS so Insights reads as the same design system, not
 * a new visual language.
 */
export const CATEGORY_ACCENTS: Record<InsightCategory, CategoryAccent> = {
  PRODUCT_ENGINEERING: { color: "#2a359c", background: "rgba(42, 53, 156, 0.1)" },
  AI_AND_AUTOMATION: { color: "#0f8f9e", background: "rgba(15, 143, 158, 0.12)" },
  RESTAURANT_TECH: { color: "#b8790a", background: "rgba(184, 121, 10, 0.12)" },
  CONNECTED_PRODUCTS: { color: "#7c5cbf", background: "rgba(124, 92, 191, 0.12)" },
  SMART_HOME: { color: "#2f8f5b", background: "rgba(47, 143, 91, 0.12)" },
  ENGINEERING: { color: "#2f6fed", background: "rgba(47, 111, 237, 0.12)" },
  FOUNDER_NOTES: { color: "#b3261e", background: "rgba(179, 38, 30, 0.1)" },
};
