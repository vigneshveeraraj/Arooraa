/**
 * Content model for /our-work (W1). Deliberately its own file, separate
 * from lib/content/work.ts — that file already backs the homepage's
 * Featured Work section (components/home/FeaturedWork.tsx) with a smaller,
 * differently-shaped MESA/supporting-work model, and the homepage is frozen
 * this milestone. Nothing here is imported by, or duplicates copy from, the
 * homepage, the Products Index (lib/content/products.ts), or any product
 * page — this is the editorial "engineering story" behind each product, not
 * another summary of what it does.
 *
 * WorkStory intentionally carries a couple of fields beyond W1's own literal
 * list (`problemLabel`, `builtLabel`) because the two section labels that
 * open and mid-anchor each story genuinely differ by maturity stage — "THE
 * PROBLEM" vs "THE IDEA", "WHAT WE ARE BUILDING" vs "WHAT WE BUILT" vs "WHAT
 * WE ARE EXPLORING" — and collapsing them to one fixed label per slot would
 * misstate a concept-stage product as if it were shipped. Visuals are
 * deliberately NOT part of this content model, matching the service-page
 * content/visual split already established in lib/content/service-page.ts —
 * each story's visual is a bespoke React component composed directly in
 * page.tsx, since MESA/Mindra/Smart Mirror/Smart Home each need a genuinely
 * different scene, not a shared generic slot.
 */

export interface WorkHeroContent {
  eyebrow: string;
  title: string;
  supporting: string;
  supportingLine: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export const WORK_HERO: WorkHeroContent = {
  eyebrow: "OUR WORK",
  title: "Products built from real problems.",
  supporting:
    "AROORAA builds its own products across software, AI, mobile, edge and connected environments. Each one starts with a problem worth understanding — then evolves through product thinking, engineering and continuous learning.",
  supportingLine: "This is where our engineering philosophy becomes something tangible.",
  primaryCta: { label: "Explore the Work", href: "#mesa" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export interface WorkIntroContent {
  title: string;
  body: string;
}

export const WORK_INTRO: WorkIntroContent = {
  title: "We build our own products because building teaches things planning alone cannot.",
  body: "Product decisions become clearer when they meet real workflows, technical constraints, edge cases, deployment realities and continued use. Our products give us a place to test those decisions for ourselves.",
};

export interface WorkMaturity {
  /** Short public status treatment, e.g. "FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT". Text only — never the sole signal of status (also stated in `description`). */
  label: string;
  description: string;
}

export interface WorkStory {
  slug: string;
  number: string;
  eyebrow: string;
  title: string;
  /** Short category label reused by the engineering-range spectrum and the cross-project map. */
  domain: string;
  lead: string;
  problemLabel: string;
  problem: string;
  productThinking: string;
  builtLabel: string;
  built: string;
  engineeringChallenge: string;
  maturity: WorkMaturity;
  demonstrates: string;
  relatedProduct: { label: string; href: string };
  /** Not rendered in W1 — carried forward for W2's individual /our-work/* pages. */
  relatedServices?: { label: string; href: string }[];
  /**
   * W2.1 — set only once a project's own /our-work/<slug> engineering story
   * exists. Undefined for every project without one yet, so FeaturedWorkStory
   * never links to a route that doesn't exist.
   */
  engineeringStory?: { label: string; href: string };
}

export const MESA_WORK_STORY: WorkStory = {
  slug: "mesa",
  number: "01",
  eyebrow: "RESTAURANT TECHNOLOGY",
  title: "MESA",
  domain: "Restaurant Technology",
  lead: "What if the restaurant experience worked as one connected system instead of a collection of disconnected tools?",
  problemLabel: "THE PROBLEM",
  problem:
    "A restaurant experience involves many people and moments — guest, table, menu, ordering, waiter, kitchen, billing, restaurant operations. When those experiences are fragmented, friction appears everywhere.",
  productThinking: "Connect customer experience with restaurant operations.",
  builtLabel: "WHAT WE ARE BUILDING",
  built: "A connected restaurant technology ecosystem.",
  engineeringChallenge: "Multiple people, roles, states and operational moments need to stay coordinated.",
  maturity: {
    label: "FLAGSHIP PRODUCT · ACTIVE DEVELOPMENT",
    description: "Flagship product in active development.",
  },
  demonstrates:
    "AROORAA's ability to think across product experience, operational workflows, multi-role systems and production engineering.",
  relatedProduct: { label: "Explore the Product", href: "/products/mesa" },
  relatedServices: [
    { label: "Product Engineering", href: "/services/product-engineering" },
    { label: "Continuous Engineering", href: "/services/continuous-engineering" },
  ],
  engineeringStory: { label: "Read the Engineering Story", href: "/our-work/mesa" },
};

export const MINDRA_WORK_STORY: WorkStory = {
  slug: "mindra",
  number: "02",
  eyebrow: "PERSONAL TECHNOLOGY",
  title: "Mindra",
  domain: "Personal Technology",
  lead: "Life creates more information than people should have to keep in their heads.",
  problemLabel: "THE PROBLEM",
  problem: "Personal and family information becomes scattered.",
  productThinking: "Create one place where information can be captured and resurfaced naturally.",
  builtLabel: "WHAT WE BUILT",
  built: "A personal and family second-brain product with private and shared spaces.",
  engineeringChallenge: "Information needs the right boundaries while still being useful across people and devices.",
  maturity: {
    label: "WORKING PRODUCT · MVP",
    description: "Working MVP, in active product evolution.",
  },
  demonstrates: "Mobile product thinking, personal data boundaries, shared workflows and everyday UX.",
  relatedProduct: { label: "Explore the Product", href: "/products/mindra" },
  relatedServices: [{ label: "Product Engineering", href: "/services/product-engineering" }],
  engineeringStory: { label: "Read the Mindra Story", href: "/our-work/mindra" },
};

export interface PhysicalTransitionContent {
  title: string;
  body: string;
}

export const PHYSICAL_TRANSITION: PhysicalTransitionContent = {
  title: "Some products begin on a screen. Others begin in the physical world.",
  body: "Smart Mirror and Arooraa Smart Home explore what happens when software, intelligence and connected hardware become part of the environment itself.",
};

export const SMART_MIRROR_WORK_STORY: WorkStory = {
  slug: "smart-mirror",
  number: "03",
  eyebrow: "AMBIENT COMPUTING",
  title: "Smart Mirror",
  domain: "Ambient Computing",
  lead: "What if useful information appeared naturally in something already part of the morning routine?",
  problemLabel: "THE IDEA",
  problem: "Make computing feel less intrusive.",
  productThinking: "Information should appear in the environment when useful rather than always requiring another app.",
  builtLabel: "WHAT WE ARE EXPLORING",
  built: "An ambient smart-mirror product for home and family experiences.",
  engineeringChallenge: "Physical product design, reflective surfaces, displays, edge computing and useful interaction must coexist.",
  maturity: {
    label: "PRODUCT CONCEPT · COMING SOON",
    description: "Concept / prototype direction · Coming Soon.",
  },
  demonstrates: "AROORAA can think beyond conventional web/mobile products into connected physical experiences.",
  relatedProduct: { label: "Explore the Product", href: "/products/smart-mirror" },
  relatedServices: [{ label: "AI, Data & Automation", href: "/services/ai-automation" }],
  engineeringStory: { label: "Read the Smart Mirror Story", href: "/our-work/smart-mirror" },
};

export const SMART_HOME_WORK_STORY: WorkStory = {
  slug: "smart-home",
  number: "04",
  eyebrow: "CONNECTED HOME",
  title: "Arooraa Smart Home",
  domain: "Connected Home",
  lead: "A smarter home should still behave like a home when the internet disappears.",
  problemLabel: "THE PROBLEM",
  problem:
    "Most “smart home” experiences depend too heavily on apps and cloud connectivity, or begin with novelty rather than measurable household value.",
  productThinking:
    "Manual control remains primary. Intelligence should add visibility and useful automation without removing normal operation.",
  builtLabel: "WHAT WE ARE EXPLORING",
  built: "A local-first, retrofit-friendly connected-home platform.",
  engineeringChallenge: "Software, edge systems, physical equipment, safety and ordinary human behavior all meet in one product.",
  maturity: {
    label: "PROTOTYPE · IN DEVELOPMENT",
    description: "Prototype, in a controlled development direction.",
  },
  demonstrates: "IoT, edge thinking, physical/digital integration and safety-aware product engineering.",
  relatedProduct: { label: "Explore the Product", href: "/products/smart-home-eb" },
  relatedServices: [{ label: "Cloud & Platform Engineering", href: "/services/cloud-platform" }],
  engineeringStory: { label: "Read the Arooraa Smart Home Story", href: "/our-work/smart-home" },
};

export const WORK_STORIES: WorkStory[] = [MESA_WORK_STORY, MINDRA_WORK_STORY, SMART_MIRROR_WORK_STORY, SMART_HOME_WORK_STORY];

export interface CrossProjectQuestion {
  question: string;
  /** Slugs of the WorkStory entries this question is most relevant to — editorial judgment, not a completeness claim. */
  relevantTo: string[];
}

export const CROSS_PROJECT_HEADING = {
  eyebrow: "Cross-Project",
  title: "Different products. Repeating engineering questions.",
  description: "The domain changes. Good product-engineering questions remain.",
};

export const CROSS_PROJECT_QUESTIONS: CrossProjectQuestion[] = [
  { question: "Who is the user?", relevantTo: ["mesa", "mindra", "smart-mirror", "smart-home"] },
  { question: "What happens when something fails?", relevantTo: ["mesa", "smart-home"] },
  { question: "What should remain simple?", relevantTo: ["mindra", "smart-home"] },
  { question: "What data needs boundaries?", relevantTo: ["mindra", "smart-mirror"] },
  { question: "What belongs locally?", relevantTo: ["smart-mirror", "smart-home"] },
  { question: "What needs real-time coordination?", relevantTo: ["mesa"] },
  { question: "What should be automated?", relevantTo: ["mesa", "smart-home"] },
  { question: "What should remain under human control?", relevantTo: ["smart-home", "smart-mirror"] },
  { question: "What is necessary now?", relevantTo: ["mesa", "mindra"] },
  { question: "What can wait?", relevantTo: ["smart-mirror", "smart-home"] },
];

export const ENGINEERING_RANGE_HEADING = {
  eyebrow: "Engineering Range",
  title: "One company. Several kinds of engineering.",
  description:
    "Product strategy, experience, web and mobile, backend, AI, cloud and edge — the four products sit in different places along the same range, conceptually.",
};

export interface EngineeringRangePoint {
  slug: string;
  name: string;
  /** 0 (pure software) – 100 (physical), conceptual only, not a measured metric. */
  start: number;
  end: number;
}

export const ENGINEERING_RANGE_POINTS: EngineeringRangePoint[] = [
  { slug: "mindra", name: "Mindra", start: 8, end: 8 },
  { slug: "mesa", name: "MESA", start: 28, end: 28 },
  { slug: "smart-mirror", name: "Smart Mirror", start: 55, end: 88 },
  { slug: "smart-home", name: "Smart Home", start: 62, end: 96 },
];

export interface WorkPrincipleItem {
  title: string;
  body: string;
}

export const WORK_PRINCIPLES_HEADING = {
  eyebrow: "What We Learned",
  title: "Building changes how you think about building.",
  description: "These are AROORAA product-engineering perspectives, not claimed universal laws.",
};

export const WORK_PRINCIPLES: WorkPrincipleItem[] = [
  {
    title: "Start smaller than the idea.",
    body: "The first version should prove the important assumptions, not contain every possibility.",
  },
  {
    title: "Operations are part of UX.",
    body: "A beautiful customer experience fails if the people operating the product cannot work effectively.",
  },
  {
    title: "Physical systems change the rules.",
    body: "When software interacts with rooms, devices, switches or people, reliability and safety matter differently.",
  },
  {
    title: "Intelligence needs context.",
    body: "AI becomes useful when connected to the right information, workflow and human decision.",
  },
  {
    title: "Products never really finish.",
    body: "Real use exposes the next engineering problem.",
  },
];

export const WORK_FINAL_CTA = {
  title: "Have a problem worth turning into a product?",
  supporting:
    "You do not need to arrive with the architecture, roadmap or complete specification. Start with the problem — we can help shape what comes next.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Explore Services", href: "/services" },
};
