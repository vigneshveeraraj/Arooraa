/**
 * W3.1 — About AROORAA. All page text lives here, separate from the bespoke
 * visual components in components/about/, matching the content/visual split
 * used throughout the /our-work/* product stories.
 */

export const ABOUT_HERO = {
  eyebrow: "ABOUT AROORAA",
  headline: "We build because we believe better products begin with better questions.",
  supporting: [
    "AROORAA is a product-engineering company focused on turning real-world problems, repeated friction and useful ideas into thoughtfully designed digital products.",
    "We look for places where people lose time, businesses struggle with unnecessary complexity, or the same problem keeps returning — and ask whether there is a better way to solve it.",
  ],
  primaryCta: { label: "Explore Our Work", href: "/our-work" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export const ABOUT_PHILOSOPHY = {
  label: "AROORAA — Product Engineering & Innovation",
  proposition: "We turn ideas and business problems into production-ready digital products.",
  quote: "AROORAA starts where someone says, “There should be a better way.”",
};

// ---------------------------------------------------------------------------
// Chapter 01 — Why AROORAA exists
// ---------------------------------------------------------------------------

export const WHY_AROORAA = {
  eyebrow: "WHY AROORAA",
  heading: "Good products often begin with a problem someone has learned to tolerate.",
  intro:
    "Many product opportunities do not begin with dramatic inventions. They begin with ordinary frustration:",
  frustrations: [
    "a workflow that takes too many steps",
    "information spread across too many places",
    "repeated manual activity",
    "unnecessary waiting",
    "unclear decisions",
    "services that are painful for customers",
    "systems that are equally difficult for providers",
    "technology that technically works but makes life harder",
  ],
  existsLine: "AROORAA exists to notice those problems.",
  complexityPrinciple: "Good products should reduce complexity, not add to it.",
  timePrinciple:
    "We are interested in reducing the amount of time people spend fighting systems that should be helping them.",
  strongMessage: "Repeated pain is often a signal that a better product should exist.",
  bridgeConnector:
    "Solving only the customer side can leave operators struggling. Solving only the operational side can create a poor customer experience. We want to understand both sides of the problem.",
  visualZones: {
    friction: "Repeated Friction",
    observation: "Observation",
    direction: "Product Direction",
  },
  originMoment: {
    label: "THE ORIGIN",
    questions: [
      "Why does this still work this way?",
      "Why is the same problem happening again?",
      "Why has everyone learned to work around it instead of fixing it?",
      "Why has nobody noticed how much time this wastes?",
    ],
    turningPoint:
      "At some point, frustration became responsibility: if a problem is real, repeated and visible, maybe it deserves to be solved properly.",
  },
};

// ---------------------------------------------------------------------------
// Chapter 02 — Products first
// ---------------------------------------------------------------------------

export interface AboutProduct {
  slug: string;
  name: string;
  world: string;
  description: string;
}

export const PRODUCTS_FIRST = {
  heading: "We do not only advise people how to build products. We build our own.",
  purposeLine:
    "Our products are different answers to the same habit: notice real friction, understand it properly, then build.",
  strongLine: "Building our own products forces us to make the same trade-offs we help clients make.",
  tradeOffs: [
    "scope",
    "user experience",
    "architecture",
    "reliability",
    "privacy",
    "security",
    "operating reality",
    "maturity",
    "cost/complexity",
    "future direction",
  ],
};

export const ABOUT_PRODUCTS: AboutProduct[] = [
  {
    slug: "mesa",
    name: "MESA",
    world: "Restaurant & Operations",
    description:
      "A connected restaurant technology ecosystem built around the relationship between guest experience and restaurant operations.",
  },
  {
    slug: "mindra",
    name: "Mindra",
    world: "Memory & Family",
    description:
      "A personal and family second brain designed around memory, everyday responsibilities and reducing mental load.",
  },
  {
    slug: "smart-mirror",
    name: "Smart Mirror",
    world: "Ambient Computing",
    description:
      "An ambient-computing and physical-product exploration asking how technology can become useful without always demanding another screen.",
  },
  {
    slug: "smart-home",
    name: "Arooraa Smart Home",
    world: "Home & Energy",
    description:
      "A local-first connected-home direction focused on reliability, energy visibility, manual control and practical household intelligence.",
  },
];

export const PRODUCT_SPINE = ["Real Problem", "Product Thinking", "Engineering"];

// ---------------------------------------------------------------------------
// Chapter 03 — Different problems, same discipline
// ---------------------------------------------------------------------------

export const SAME_DISCIPLINE = {
  heading: "The products are different. The discipline behind them is not.",
  intro: "MESA, Mindra, Smart Mirror and Arooraa Smart Home operate in very different worlds.",
  disciplineIntro: "But the engineering discipline remains consistent:",
  steps: [
    "understand the actual problem",
    "understand the people affected",
    "understand provider/operator reality",
    "remove unnecessary complexity",
    "define what matters",
    "make product trade-offs",
    "design the experience",
    "make architecture decisions",
    "build",
    "validate",
    "operate",
    "learn",
    "evolve",
  ],
  timeBackLine:
    "A good product should give time back — fewer unnecessary steps, fewer repeated actions and fewer things people have to remember or work around.",
};

// ---------------------------------------------------------------------------
// Chapter 04 — From idea to production
// ---------------------------------------------------------------------------

export const IDEA_TO_PRODUCTION = {
  heading: "We like ideas. We care even more about what it takes to make them real.",
  journey: ["Discovery", "Product Strategy", "UX", "Architecture", "Engineering", "AI", "Cloud", "Launch", "Continuous Support"],
  entryIntro: "Clients may enter at different points:",
  entryPoints: [
    "an idea",
    "an unclear business problem",
    "an MVP",
    "an existing application",
    "modernization",
    "an AI opportunity",
    "a cloud/platform problem",
    "a reliability issue",
    "ongoing product evolution",
  ],
  cta: { label: "Explore Services", href: "/services" },
};

// ---------------------------------------------------------------------------
// Chapter 05 — Customer + provider bridge
// ---------------------------------------------------------------------------

export const CUSTOMER_PROVIDER_BRIDGE = {
  heading: "A useful product has to work for both sides of the experience.",
  intro: "Many systems connect two worlds.",
  examples: [
    "customer ↔ restaurant",
    "family member ↔ shared household",
    "user ↔ service provider",
    "customer ↔ operator",
    "digital experience ↔ physical delivery",
  ],
  bodyLines: [
    "A product can look excellent for a customer and still create chaos behind the scenes.",
    "Or operational software can be efficient while making the customer experience painful.",
    "AROORAA wants to understand both.",
  ],
  strongLine: "The customer experience and the provider experience are usually two halves of the same product problem.",
  sides: { left: "Customer / User", right: "Provider / Operator" },
  signals: ["Request", "Context", "Action", "Response", "Feedback"],
};

// ---------------------------------------------------------------------------
// Chapter 06 — Product thinking + engineering
// ---------------------------------------------------------------------------

export const PRODUCT_AND_ENGINEERING = {
  heading: "We do not separate empathy from engineering.",
  bodyLines: [
    "Understanding frustration is part of product design.",
    "Understanding operating reality is part of engineering.",
  ],
  concerns: [
    "Business purpose",
    "User need",
    "Provider reality",
    "UX",
    "Architecture",
    "Engineering",
    "Quality",
    "Security",
    "Operations",
  ],
  centerLabel: "The Product",
  strongPrinciple: "Product thinking and engineering should not live in separate rooms.",
};

// ---------------------------------------------------------------------------
// Chapter 07 — AI is a capability, not the identity
// ---------------------------------------------------------------------------

export const AI_CAPABILITY = {
  heading: "We use AI where it makes the product more useful — not because every product needs an AI label.",
  roles: [
    "reducing repetitive work",
    "improving retrieval",
    "assisting decisions",
    "summarising information",
    "automation",
    "generation",
    "analysis",
    "natural interaction",
    "engineering productivity",
  ],
  timeComplexityLine:
    "AI earns its place when it removes useful work from the user's head or hands — not when it simply makes the product sound modern.",
  limitsIntro: "And it has limits we hold to:",
  limits: [
    "deterministic systems still matter",
    "privacy matters",
    "security matters",
    "safety matters",
    "human control matters",
    "AI should solve a product problem",
  ],
};

// ---------------------------------------------------------------------------
// Chapter 08 — Engineering principles
// ---------------------------------------------------------------------------

export interface EngineeringPrinciple {
  title: string;
  body: string;
}

export const ENGINEERING_PRINCIPLES_HEADING = "Some engineering decisions should remain boring. That is often a good thing.";

export const ENGINEERING_PRINCIPLES: EngineeringPrinciple[] = [
  { title: "Solve the real problem", body: "Do not optimize the wrong thing beautifully." },
  { title: "Reduce unnecessary complexity", body: "People should spend less time fighting the system." },
  { title: "Build for change", body: "Products evolve." },
  { title: "Reliability matters", body: "Working once is not the same as being dependable." },
  { title: "Security by design", body: "Trust cannot be added at the end." },
  { title: "Keep complexity earned", body: "Do not choose technology because it looks sophisticated." },
  { title: "Evidence before assumptions", body: "Measure, observe, then optimize." },
  { title: "Human control matters", body: "Especially with automation, AI and physical systems." },
  { title: "Operate what we build", body: "Production reality should influence design decisions." },
];

// ---------------------------------------------------------------------------
// Chapter 09 — Building honestly
// ---------------------------------------------------------------------------

export const BUILDING_HONESTLY = {
  heading: "We would rather show thoughtful work than manufacture the appearance of scale.",
  intro: "AROORAA is being built deliberately:",
  deliberateSteps: ["product by product", "capability by capability", "engineering decision by engineering decision"],
  preferLabel: "We prefer",
  prefer: ["real products", "prototypes", "working software", "honest maturity", "visible thinking", "lessons", "product evolution"],
  doNotNeedLabel: "We do not need",
  doNotNeed: [
    "fabricated customer counts",
    "inflated team size",
    "fake global-office maps",
    "meaningless success percentages",
    "fake testimonials",
    "unearned partnership logos",
  ],
  strongIdea: "Credibility should come from the work.",
};

// ---------------------------------------------------------------------------
// Chapter 10 — Founder-led, product-led
// ---------------------------------------------------------------------------

export const FOUNDER_LED = {
  heading: "AROORAA is founder-led and product-led.",
  origin:
    "AROORAA comes from hands-on software and product engineering and from repeatedly encountering problems that felt unnecessarily difficult.",
  recurringThought: "The recurring thought:",
  questions: [
    "Why does this still work this way?",
    "Why is everyone repeating the same workaround?",
    "Why is this taking so much time?",
    "Why has nobody solved the actual pain?",
  ],
  belief:
    "AROORAA grew from the belief that repeated frustration can be useful information. If a problem keeps appearing, it may be pointing toward a product that should exist.",
  contextIntro: "Public, safe context:",
  context: [
    "long-term software engineering experience",
    "hands-on architecture/product development",
    "backend/platform/product engineering",
    "AI",
    "cloud",
    "connected physical-product exploration",
  ],
  wallNotes: [
    "Why does this take so long?",
    "Why are we repeating this?",
    "What if these two sides were connected?",
    "Can this be simpler?",
  ],
};

// ---------------------------------------------------------------------------
// Chapter 11 — What AROORAA wants to become
// ---------------------------------------------------------------------------

export const FUTURE_DIRECTION = {
  heading: "The goal is not to build one successful product. It is to build the ability to keep creating them.",
  directions: [
    "own-product portfolio",
    "product engineering",
    "AI/data",
    "cloud/platform",
    "application modernization",
    "connected physical products",
    "client product partnerships",
    "continuous engineering",
  ],
  strongMessage:
    "Products may change. The ability to understand problems and engineer useful responses is the capability we want to compound.",
  horizonDomains: ["Software", "AI & Data", "Cloud & Platform", "Connected Products"],
};

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------

export const ABOUT_CLOSING = {
  heading: "There should always be room to ask whether something can work better.",
  supporting:
    "If you are exploring a new product, trying to improve an existing one, or repeatedly encountering a business problem that should not be this difficult, that is the kind of conversation AROORAA wants to have.",
  principle: "Notice the pain. Understand the problem. Reduce the complexity. Build something better.",
  primaryCta: { label: "Start a Project", href: "/start-project" },
  secondaryCta: { label: "Explore Our Work", href: "/our-work" },
};
