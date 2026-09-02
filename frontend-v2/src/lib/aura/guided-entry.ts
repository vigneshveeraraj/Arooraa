import { PRODUCTS } from "@/lib/content/products";
import { SERVICE_GROUPS } from "@/lib/content/services";

/**
 * The guided first-open taxonomy (A4.1). Deliberately sourced from the site's own content modules
 * rather than hand-written here a second time — a route or a name can only ever be one the real
 * site actually serves, and if a product or service is ever added, renamed or removed in
 * `lib/content`, this list moves with it instead of quietly going stale.
 */

export interface AuraGuidedProduct {
  id: string;
  name: string;
  tagline: string;
  href: string;
}

/** Short, owner-approved taglines — the one thing not already in `products.ts`, which carries a
 * much longer marketing description than a guided-menu row has room for. */
const PRODUCT_TAGLINES: Record<string, string> = {
  mesa: "Connected restaurant technology",
  mindra: "Personal & family second brain",
  "smart-mirror": "Ambient intelligent mirror",
  "smart-home-eb": "Local-first connected living",
};

export const AURA_GUIDED_PRODUCTS: AuraGuidedProduct[] = PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  href: product.href,
  tagline: PRODUCT_TAGLINES[product.id] ?? product.positioning,
}));

export interface AuraGuidedService {
  id: string;
  name: string;
  href: string;
}

export const AURA_GUIDED_SERVICES: AuraGuidedService[] = SERVICE_GROUPS.map((service) => ({
  id: service.id,
  name: service.name,
  href: service.href,
}));

/** The known-route destinations for the guided menu's non-product, non-service choices. */
export const AURA_GUIDED_LINKS = {
  about: "/about",
  careers: "/careers",
  contact: "/contact",
} as const;
