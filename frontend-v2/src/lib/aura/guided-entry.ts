import { PRODUCT_NAV_LINKS, SERVICE_NAV_LINKS } from "@/lib/content/navigation";

/**
 * The guided menu's taxonomy (A4.1, rebuilt on the shared navigation model in A5.2.3).
 *
 * <p>Products and services are the site's own header lists, read from `lib/content/navigation.ts`
 * rather than assembled here from a second source. That is the point of the shared model: Aura and
 * the header cannot disagree about what a product is called or where it lives, because there is
 * only one list and both of them read it.
 */

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
  /** One quiet line under the name, where the name alone does not say what the thing is. */
  descriptor?: string;
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

/**
 * The four products and six services, as places Aura can open.
 *
 * <p>The acknowledgement is built from the label rather than written out sixteen times, which is
 * what keeps it honest: a product renamed in the navigation model is renamed in the sentence Aura
 * says about it, in the same edit. Two shapes rather than one, because "our Product Engineering
 * service" reads as English and "our MESA service" does not.
 *
 * <p>Selecting one asks no provider anything — it opens a page and says so, exactly as About,
 * Careers and Contact do. Before A5.2.3 it sent "Tell me about MESA" and spent a model call on a
 * click that had already said where the visitor wanted to go; the grounded conversation now starts
 * when they ask something, on the page they are standing on.
 */
export const AURA_GUIDED_PRODUCTS: AuraGuidedDestination[] = PRODUCT_NAV_LINKS.map((product) => ({
  ...product,
  acknowledgement: `I've opened ${product.label} for you.`,
}));

export const AURA_GUIDED_SERVICES: AuraGuidedDestination[] = SERVICE_NAV_LINKS.map((service) => ({
  ...service,
  acknowledgement: `I've opened our ${service.label} service for you.`,
}));
