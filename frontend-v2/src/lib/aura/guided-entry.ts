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

/**
 * A place the guided menu can open by itself: what the visitor pressed, where it goes, and what
 * Aura says when it takes them there.
 *
 * <p>The three belong together because they are one fact. Aura is claiming to have opened a
 * particular page, so a sentence naming a different page than the one it navigates to would be
 * Aura telling a visitor something untrue — and the label the visitor pressed is what that
 * sentence is answering. Fixed copy per destination, not assembled from a template and not chosen
 * at random: what a visitor is told is then something the owner can read here in full.
 */
export interface AuraGuidedDestination {
  /** The words on the button, and afterwards the visitor's own turn in the conversation. */
  label: string;
  href: string;
  /**
   * Aura's own words, written by us. Deterministic navigation asks no provider anything: the
   * client already knows which choice was made and where it leads, so there is nothing to infer,
   * nothing to wait for, and nothing that could come back wrong (A5.2.2, owner finding 2).
   */
  acknowledgement: string;
}

/** The known-route destinations for the guided menu's non-product, non-service choices. */
export const AURA_GUIDED_LINKS: Record<"about" | "careers" | "contact", AuraGuidedDestination> = {
  about: {
    label: "About AROORAA",
    href: "/about",
    acknowledgement: "Sure — I've opened the About AROORAA page for you.",
  },
  careers: {
    label: "Careers",
    href: "/careers",
    acknowledgement: "I've opened our Careers page for you.",
  },
  contact: {
    label: "Contact",
    href: "/contact",
    acknowledgement: "I've opened the Contact page for you.",
  },
};
