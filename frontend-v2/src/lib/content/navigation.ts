export interface NavLink {
  label: string;
  href: string;
}

/**
 * One destination inside a header section's menu.
 *
 * <p>The descriptor is one quiet line under the name, and it is optional because it is only worth
 * having where the name alone does not say what the thing is. The four products carry one; the six
 * services do not, because their names already describe them and six descriptors would turn a menu
 * into a mega-menu.
 */
export interface NavChild extends NavLink {
  descriptor?: string;
}

/**
 * A top-level header item. `children` is what makes it a menu rather than a plain link, and it is
 * present only where the site genuinely has several public destinations under that heading — never
 * to give every item a matching chevron.
 */
export interface NavSection extends NavLink {
  children?: NavChild[];
}

/**
 * The canonical public product list: the four names, their real routes, and the one line each.
 *
 * <p>This is the single definition (A5.2.3). The header menu, the footer column and Aura's guided
 * menu all read it, so a product cannot be called one thing in the header and another in Aura, or
 * point at two different routes from two different places. Descriptors are the owner's own words.
 */
export const PRODUCT_NAV_LINKS: NavChild[] = [
  { label: "MESA", href: "/products/mesa", descriptor: "Connected restaurant technology" },
  { label: "Mindra", href: "/products/mindra", descriptor: "Your personal and family second brain" },
  { label: "Smart Mirror", href: "/products/smart-mirror", descriptor: "Ambient AI · Coming Soon" },
  {
    label: "Arooraa Smart Home",
    href: "/products/smart-home-eb",
    descriptor: "Connected-home prototype",
  },
];

/** The canonical public service list — the six frozen Phase 0 §4 groups, and their real pages. */
export const SERVICE_NAV_LINKS: NavChild[] = [
  { label: "Product Strategy & Discovery", href: "/services/product-discovery" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "AI, Data & Automation", href: "/services/ai-automation" },
  { label: "Application Modernization", href: "/services/application-modernization" },
  { label: "Cloud & Platform Engineering", href: "/services/cloud-platform" },
  { label: "Continuous Engineering", href: "/services/continuous-engineering" },
];

/**
 * Frozen desktop/mobile navigation order — AROORAA Phase 0 §8. "Our Work"
 * pointed at /work (a route that never existed) until W1 built the real
 * page at /our-work and this file's two hrefs were corrected to match —
 * order and labels are otherwise unchanged.
 *
 * <p>A5.2.3 gave Products and Services their real children. Our Work and Insights deliberately
 * stayed plain links: Our Work's four children are engineering stories about the same four
 * products, so a menu would put those names in the header twice pointing at different routes, and
 * its index page already lists all four; Insights has one real destination and nothing worth
 * inventing a second for.
 */
export const PRIMARY_NAV_LINKS: NavSection[] = [
  { label: "Products", href: "/products", children: PRODUCT_NAV_LINKS },
  { label: "Services", href: "/services", children: SERVICE_NAV_LINKS },
  { label: "Our Work", href: "/our-work" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** The primary conversion CTA — always visually distinct from regular nav links. */
export const START_PROJECT_LINK: NavLink = { label: "Start a Project", href: "/start-project" };

/*
 * The footer's product and service columns are the same two lists as the header menus, and were
 * previously written out a second time here. One definition, two readers: a route corrected in one
 * place is corrected in both.
 */
export const FOOTER_PRODUCT_LINKS: NavLink[] = PRODUCT_NAV_LINKS;

export const FOOTER_SERVICE_LINKS: NavLink[] = SERVICE_NAV_LINKS;

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
