/**
 * Content for /our-work/mesa (W2.1) — the first Our Work engineering story.
 * Deliberately its own file/folder, separate from lib/content/our-work.ts
 * (the index page's summary content) and lib/content/products.ts (the real
 * MESA product page) — this page tells neither of those stories again. It
 * explains how AROORAA thought about the restaurant problem, not what MESA
 * does or why it's worth building on (those already exist elsewhere).
 * Deliberately public-safe throughout: no internal service names, APIs,
 * data stores, event systems, permission internals, production topology or
 * unreleased roadmap detail, and no fabricated customers/metrics/results —
 * only the thinking is shown, never the implementation.
 */

export const MESA_STORY_HERO = {
  eyebrow: "AROORAA ENGINEERING STORY · MESA",
  title: "One restaurant. Many moments. One connected experience.",
  supporting:
    "MESA began with a simple observation: a restaurant visit may feel like one experience to the guest, but behind it are many people, decisions and operational handoffs that need to stay coordinated.",
  maturityLabel: "FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT",
  primaryCta: { label: "Explore MESA", href: "/products/mesa" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export interface StoryChapterHeading {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  supporting?: string;
}

export const CHAPTER_GUEST_VS_OPERATIONS: StoryChapterHeading = {
  id: "guest-vs-operations",
  index: "01",
  eyebrow: "The Original Observation",
  title: "The guest sees one meal. The restaurant manages dozens of moments.",
  supporting: "Simple customer experiences often hide significant operational complexity.",
};

export const GUEST_JOURNEY = ["Scan", "Browse", "Order", "Wait", "Eat", "Request Bill", "Pay"];

export const OPERATIONAL_MOMENTS = [
  "Table",
  "Menu",
  "Guest Choices",
  "Staff",
  "Kitchen",
  "Service",
  "Order State",
  "Billing",
  "Operations",
];

export const CHAPTER_FRAGMENTATION: StoryChapterHeading = {
  id: "fragmentation",
  index: "02",
  eyebrow: "Where Fragmentation Appears",
  title: "The problem was not one missing feature. It was fragmentation between moments.",
  supporting: "MESA connects the experience around the table.",
};

export const FRAGMENTS = ["Guest / Menu", "Waiter / Order", "Kitchen", "Billing"];

export const CHAPTER_TABLE_ORBIT: StoryChapterHeading = {
  id: "table-orbit",
  index: "03",
  eyebrow: "The Table Became The Center",
  title: "We stopped thinking about isolated features and started thinking around the table.",
  supporting: "The table is where customer experience and restaurant operations meet.",
};

export const TABLE_ORBIT_ITEMS = ["Guest", "Menu", "Order", "Staff", "Kitchen", "Service", "Billing"];

export const CHAPTER_ROLE_PERSPECTIVES: StoryChapterHeading = {
  id: "role-perspectives",
  index: "04",
  eyebrow: "Designing For People, Not Modules",
  title: "A restaurant product serves different people at the same time.",
};

export interface RolePerspective {
  role: string;
  quote: string;
}

export const ROLE_PERSPECTIVES: RolePerspective[] = [
  { role: "Guest", quote: "What do I want to eat, and what happens next?" },
  { role: "Waiter / Service Team", quote: "What does this table need right now?" },
  { role: "Kitchen", quote: "What should we prepare, and what is its current state?" },
  { role: "Restaurant Owner / Manager", quote: "Is the operation moving clearly?" },
];

/**
 * W2.1.2D — a short, unnumbered bridging section between Chapter 4 (four
 * roles) and Chapter 5 (product decisions): a whole-ecosystem summary
 * showing how MESA connects those roles, before the story moves on to the
 * decisions behind the system. Deliberately not a StoryChapterHeading —
 * it carries no chapter index/eyebrow-as-chapter-number, since it isn't
 * one of the fifteen numbered chapters.
 */
export const MESA_ECOSYSTEM_TRANSITION = {
  eyebrow: "MESA ECOSYSTEM",
  heading: "MESA connects the restaurant as one operating experience.",
  supporting: "Different moments. Different roles. One connected restaurant experience.",
};

export const CHAPTER_PRODUCT_DECISIONS: StoryChapterHeading = {
  id: "product-decisions",
  index: "05",
  eyebrow: "Product Decisions",
  title: "The product became clearer through a series of decisions.",
};

export interface ProductDecision {
  number: string;
  title: string;
  description: string;
}

export const PRODUCT_DECISIONS: ProductDecision[] = [
  {
    number: "01",
    title: "Make the table the shared context.",
    description:
      "Every role — guest, staff, kitchen — relates to the same table and the same moment, instead of separate disconnected screens.",
  },
  {
    number: "02",
    title: "Keep the guest journey simple.",
    description:
      "The guest can scan the table QR, browse, order and call a waiter directly — simple actions the guest controls from the table, however much complexity exists behind the scenes.",
  },
  {
    number: "03",
    title: "Let restaurant operations remain visible behind the experience.",
    description:
      "The guest-facing experience sits in front; the operational layers that support it stay present, not hidden or bolted on.",
  },
  {
    number: "04",
    title: "Design state changes deliberately.",
    description: "A meal moves through clear, intentional stages rather than an open-ended, undefined process.",
  },
  {
    number: "05",
    title: "Treat recovery and exceptions as product design, not afterthoughts.",
    description: "When something needs to change mid-journey, the product is designed to handle it, not just the ideal path.",
  },
];

export const CHAPTER_MEAL_TIMELINE: StoryChapterHeading = {
  id: "meal-timeline",
  index: "06",
  eyebrow: "The Meal As A Living Timeline",
  title: "A meal is not a transaction. It is a timeline.",
};

export interface MealStage {
  label: string;
  description: string;
}

/**
 * W2.1.2B — corrected to make the mobile-first guest journey explicit: a
 * "Scan" stage was added (scanning the table QR was previously implicit),
 * and the closing stages were consolidated so the guest's own continued
 * presence at the table (waiting, playing, calling a waiter) reads as part
 * of the timeline rather than a single generic "Continue".
 */
export const MEAL_TIMELINE_STAGES: MealStage[] = [
  { label: "Arrive", description: "Guest reaches the table." },
  { label: "Scan", description: "Scan the table QR." },
  { label: "Discover", description: "Browse the menu on mobile." },
  { label: "Order", description: "Place the order from the phone." },
  { label: "Prepare", description: "Kitchen begins preparation." },
  { label: "Wait & Engage", description: "Follow the moment, play a lightweight game, or call the waiter when needed." },
  { label: "Serve & Continue", description: "Food arrives; the guest can continue the table experience." },
  { label: "Bill & Complete", description: "Complete the dining journey." },
];

export const CHAPTER_ENGINEERING_SYNC: StoryChapterHeading = {
  id: "engineering-sync",
  index: "07",
  eyebrow: "Engineering Challenge",
  title: "The hard part is keeping the experience coherent while everything changes.",
  supporting: "Multiple people can act at different times, but everyone still needs to understand the same restaurant state.",
};

export const SYNC_LANES = ["Guest", "Table", "Service", "Kitchen", "Billing"];

export const CHAPTER_EDGE_CASES: StoryChapterHeading = {
  id: "edge-cases",
  index: "08",
  eyebrow: "Edge Cases Shape Serious Products",
  title: "The happy path proves the idea. Edge cases prove the product.",
  supporting: "Production products must remain coherent when real life does not follow the perfect sequence.",
};

export const EDGE_CASES = [
  "Another guest joins",
  "An item changes",
  "Service is delayed",
  "A request is cancelled",
  "The bill is requested",
  "Connectivity changes",
  "The page is revisited",
  "Staff and guest actions overlap",
];

export const CHAPTER_UX_OPERATIONS: StoryChapterHeading = {
  id: "ux-operations",
  index: "09",
  eyebrow: "Product + Operations",
  title: "Customer UX and restaurant operations cannot be designed separately.",
  supporting: "Product quality depends on both sides working together.",
};

export const FRONT_OF_EXPERIENCE = ["Guest", "Menu", "Table", "Ordering", "Service"];
export const OPERATING_REALITY = ["Staff", "Kitchen", "Billing", "Availability", "Operational States"];

export const CHAPTER_ECOSYSTEM: StoryChapterHeading = {
  id: "ecosystem",
  index: "10",
  eyebrow: "What We Built",
  title: "The idea became a connected restaurant ecosystem.",
};

export interface CapabilityCluster {
  name: string;
  description: string;
  future?: boolean;
}

export const CAPABILITY_CLUSTERS: CapabilityCluster[] = [
  { name: "Dine-In", description: "Guest, table, menu and order experience." },
  { name: "Restaurant Operations", description: "Staff, service and table workflows." },
  { name: "Kitchen", description: "Preparation and fulfillment." },
  { name: "Billing / POS", description: "Commercial completion." },
  { name: "Management", description: "Restaurant setup and operational control." },
  { name: "Intelligence", description: "Future operational assistance and insight.", future: true },
];

export const CHAPTER_EVOLUTION: StoryChapterHeading = {
  id: "evolution",
  index: "11",
  eyebrow: "Build / Learn / Evolve",
  title: "MESA did not emerge fully formed. It evolved through use, testing and correction.",
  supporting: "Product development is a sequence of validated decisions, not one giant implementation.",
};

export const EVOLUTION_STEPS = ["Idea", "Build", "Test", "Observe", "Correct", "Expand"];

export const CHAPTER_BOUNDARY: StoryChapterHeading = {
  id: "what-we-didnt-build",
  index: "12",
  eyebrow: "Deliberate Restraint",
  title: "Good product engineering also means deciding what not to build yet.",
};

export const BOUNDARY_INSIDE = ["Essential restaurant experience", "Core operations", "Reliable workflows", "Production foundations"];
export const BOUNDARY_OUTSIDE = [
  "Unnecessary complexity",
  "Premature automation",
  "Speculative integrations",
  "Features without validated need",
];

export const CHAPTER_ENGINEERING_STACK: StoryChapterHeading = {
  id: "engineering-stack",
  index: "13",
  eyebrow: "Engineering Range",
  title: "MESA forced us to think across the whole product stack.",
};

export const ENGINEERING_STACK_LAYERS = [
  "Experience",
  "Product Workflows",
  "Web / Mobile",
  "Backend",
  "Data",
  "Real-Time",
  "Quality",
  "Cloud / Operations",
];

export const CHAPTER_MATURITY: StoryChapterHeading = {
  id: "maturity",
  index: "14",
  eyebrow: "Current Maturity",
  title: "Where MESA is today.",
};

export const MATURITY_STATEMENT = {
  label: "FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT",
  body: "MESA is an actively evolving AROORAA product. Core restaurant experiences and operational workflows are being built, tested and strengthened progressively as the ecosystem expands.",
};

export const CHAPTER_PROOF: StoryChapterHeading = {
  id: "proof",
  index: "15",
  eyebrow: "What MESA Demonstrates About AROORAA",
  title: "What building MESA taught us to prove.",
};

export const PROOF_CAPABILITIES = [
  "Product Strategy",
  "Workflow Design",
  "Multi-Role UX",
  "Backend Engineering",
  "Real-Time Behavior",
  "Quality Engineering",
  "Security Boundaries",
  "Platform Thinking",
  "Production Operations",
  "Product Evolution",
];

export const PROOF_CONCLUSION =
  "MESA is not simply a restaurant product in our portfolio. It is one of the places where AROORAA continuously exercises the product-engineering discipline we offer to others.";

export const MESA_STORY_RELATED_LINKS = [
  { label: "Explore MESA", href: "/products/mesa" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "Continuous Engineering", href: "/services/continuous-engineering" },
  { label: "Start a Project", href: "/start-project" },
];

export const MESA_STORY_FINAL_CTA = {
  title: "Have a workflow this complex that should feel much simpler?",
  supporting:
    "Start with the business problem. We can help turn the operational complexity behind it into a product people can actually use.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Explore MESA", href: "/products/mesa" },
};
