import type { CareerFamilyId } from "@/lib/careers/families";

export interface FamilyAccent {
  color: string;
  background: string;
}

/**
 * One restrained accent per family (W3.3A §8: "give each family a
 * restrained visual identity"), drawn from the same deep-navy / electric-blue
 * / cyan / subtle-purple / restrained-amber palette described for the hero
 * visual (§5), plus one supporting green for Marketing & Growth.
 */
export const FAMILY_ACCENTS: Record<CareerFamilyId, FamilyAccent> = {
  "ai-data": { color: "#0f8f9e", background: "rgba(15, 143, 158, 0.12)" },
  "backend-engineering": { color: "#2f6fed", background: "rgba(47, 111, 237, 0.12)" },
  "frontend-engineering": { color: "#2a359c", background: "rgba(42, 53, 156, 0.1)" },
  "product-design": { color: "#7c5cbf", background: "rgba(124, 92, 191, 0.12)" },
  sales: { color: "#b8790a", background: "rgba(184, 121, 10, 0.12)" },
  "marketing-growth": { color: "#2f8f5b", background: "rgba(47, 143, 91, 0.12)" },
};
