export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  supporting: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  productLabels: string[];
}

/**
 * Primary + supporting copy are the frozen Phase 0 §2 text, used verbatim —
 * not paraphrased. Headline renders at --text-h1, not --text-display: at 13
 * words it's a sentence, not a punchy tagline, and --text-display's larger
 * mobile size would push the CTA well below the fold.
 */
export const HERO_CONTENT: HeroContent = {
  eyebrow: "Product Engineering & Innovation",
  headline: "We turn ideas and business problems into production-ready digital products.",
  supporting:
    "From product discovery and design to engineering, AI, cloud deployment and continuous support, AROORAA helps businesses turn opportunities into reliable technology.",
  primaryCta: { label: "Start a Project", href: "/start-project" },
  secondaryCta: { label: "Explore Our Products", href: "/products" },
  productLabels: ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"],
};

/**
 * M3A.1: removed from the Hero (kept it commercially focused) but preserved
 * here for the later Stories section (Phase 0 §9/§11), where it can get
 * stronger treatment rather than being deleted from the content plan.
 */
export const STORY_LINE = "AROORAA starts where someone says, “There should be a better way.”";

export interface ProductSnapshotItem {
  id: string;
  name: string;
  positioning: string;
  description: string;
  status?: string;
  href: string;
  featured?: boolean;
}

/**
 * "Built by AROORAA" is reserved for the Our Work / case-study section
 * (Phase 0 §12) — kept distinct here to avoid the same phrase doing two jobs.
 */
export const PRODUCTS_SNAPSHOT_HEADING = {
  eyebrow: "Products",
  title: "Our Products",
  description: "Our own products, designed and engineered by AROORAA.",
};

/**
 * MESA/Mindra/Smart Mirror/Arooraa Smart Home — the approved four-product
 * portfolio (portfolio-correction milestone). Marion was removed: it is not
 * an AROORAA product, and now lives in service/solution planning instead
 * (see src/lib/content/services-planning.ts). Arooraa Smart Home (route
 * stays /products/smart-home-eb for continuity) is early-stage, so its copy
 * stays restrained rather than inventing functionality.
 */
export const PRODUCTS_SNAPSHOT: ProductSnapshotItem[] = [
  {
    id: "mesa",
    name: "MESA",
    positioning: "Restaurant technology ecosystem",
    description:
      "Dine-in, ordering, kitchen and staff operations, working together as real-time restaurant intelligence.",
    status: "Flagship product",
    href: "/products/mesa",
    featured: true,
  },
  {
    id: "mindra",
    name: "Mindra",
    positioning: "Personal and family second brain",
    description: "A shared second brain for memory, planning and everyday family life.",
    href: "/products/mindra",
  },
  {
    id: "smart-mirror",
    name: "Smart Mirror",
    positioning: "Ambient smart-mirror and edge-computing experience",
    description: "An ambient, voice-driven mirror experience — AI and edge computing in your home.",
    href: "/products/smart-mirror",
  },
  {
    id: "smart-home-eb",
    name: "Arooraa Smart Home",
    positioning: "Connected home energy and electrical intelligence",
    description: "Exploring smarter ways to understand and automate electrical systems inside the home.",
    href: "/products/smart-home-eb",
  },
];
