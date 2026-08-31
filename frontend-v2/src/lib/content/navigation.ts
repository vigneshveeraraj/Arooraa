export interface NavLink {
  label: string;
  href: string;
}

/**
 * Frozen desktop/mobile navigation order — AROORAA Phase 0 §8. "Our Work"
 * pointed at /work (a route that never existed) until W1 built the real
 * page at /our-work and this file's two hrefs were corrected to match —
 * order and labels are otherwise unchanged.
 */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/our-work" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** The primary conversion CTA — always visually distinct from regular nav links. */
export const START_PROJECT_LINK: NavLink = { label: "Start a Project", href: "/start-project" };

export const FOOTER_PRODUCT_LINKS: NavLink[] = [
  { label: "MESA", href: "/products/mesa" },
  { label: "Mindra", href: "/products/mindra" },
  { label: "Smart Mirror", href: "/products/smart-mirror" },
  { label: "Arooraa Smart Home", href: "/products/smart-home-eb" },
];

export const FOOTER_SERVICE_LINKS: NavLink[] = [
  { label: "Product Strategy & Discovery", href: "/services/product-discovery" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "AI, Data & Automation", href: "/services/ai-automation" },
  { label: "Application Modernization", href: "/services/application-modernization" },
  { label: "Cloud & Platform Engineering", href: "/services/cloud-platform" },
  { label: "Continuous Engineering", href: "/services/continuous-engineering" },
];

export const FOOTER_COMPANY_LINKS: NavLink[] = [
  { label: "Our Work", href: "/our-work" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

/**
 * Structural slots only — Phase 0 §11/§9 forbid fabricated legal or social
 * destinations. Both stay empty until real, confirmed URLs exist; SiteFooter
 * renders nothing for either list while it's empty.
 */
export const SOCIAL_LINKS: NavLink[] = [];
export const LEGAL_LINKS: NavLink[] = [];
