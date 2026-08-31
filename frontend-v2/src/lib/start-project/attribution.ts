import type { AttributionContext } from "./types";

/**
 * Known product/service routes mapped to a readable source context (W3.2A
 * §28) — e.g. arriving from /products/smart-mirror carries
 * sourceContext "SMART_MIRROR". The /our-work/* engineering-story routes
 * map to the same underlying product, since both reflect the same
 * visitor interest.
 */
const ROUTE_TO_SOURCE_CONTEXT: Record<string, string> = {
  "/products/mesa": "MESA",
  "/our-work/mesa": "MESA",
  "/products/mindra": "MINDRA",
  "/our-work/mindra": "MINDRA",
  "/products/smart-mirror": "SMART_MIRROR",
  "/our-work/smart-mirror": "SMART_MIRROR",
  "/products/smart-home-eb": "SMART_HOME",
  "/our-work/smart-home": "SMART_HOME",
  "/services/ai-automation": "AI_DATA_AUTOMATION",
  "/services/application-modernization": "APPLICATION_MODERNIZATION",
  "/services/cloud-platform": "CLOUD_PLATFORM",
  "/services/continuous-engineering": "CONTINUOUS_ENGINEERING",
  "/services/product-discovery": "PRODUCT_DISCOVERY",
  "/services/product-engineering": "PRODUCT_ENGINEERING",
};

function sameOriginPath(referrer: string): string | undefined {
  try {
    const url = new URL(referrer);
    if (typeof window !== "undefined" && url.origin !== window.location.origin) return undefined;
    return url.pathname;
  } catch {
    return undefined;
  }
}

/**
 * Best-effort attribution capture, read once when the Start Project page
 * mounts. Only the referrer (a browser-provided value) and this page's own
 * URL are available without instrumenting every other page — this
 * milestone does not modify Homepage/Products/Services/Our Work, so a true
 * cross-page "landing route" would need a separate, later, site-wide
 * mechanism.
 */
export function captureAttribution(): AttributionContext {
  if (typeof window === "undefined") return {};

  const referrer = document.referrer || undefined;
  const referrerPath = referrer ? sameOriginPath(referrer) : undefined;
  const sourceContext = referrerPath ? ROUTE_TO_SOURCE_CONTEXT[referrerPath] : undefined;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") ?? undefined;
  const utmMedium = params.get("utm_medium") ?? undefined;
  const utmCampaign = params.get("utm_campaign") ?? undefined;
  const utmContent = params.get("utm_content") ?? undefined;

  return {
    sourceContext,
    entryRoute: referrerPath,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
  };
}
