/**
 * Internal planning metadata only — not imported or rendered anywhere on the
 * public site. Marion is not an AROORAA product (see PRODUCTS_SNAPSHOT in
 * src/lib/content/home.ts); it is a future service/solution direction under
 * Product Engineering, to be finalized separately from its project context.
 * Do not publish unsupported Marion details, and do not create the future
 * route below until that finalization happens (portfolio-correction
 * milestone §12/§13).
 */
export interface FutureServiceConcept {
  name: string;
  direction: string;
  relatedServiceId: string;
  possibleFutureRoute: string;
}

export const MARION_FUTURE_SERVICE: FutureServiceConcept = {
  name: "Marion",
  direction: "Bakery-focused technology / digital engineering service",
  relatedServiceId: "product-engineering",
  possibleFutureRoute: "/services/bakery-technology",
};
