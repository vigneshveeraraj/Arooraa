export interface ProductSummary {
  id: string;
  name: string;
  positioning: string;
  description: string;
  engineeringFocus: string[];
  status?: string;
  href: string;
}

export const PRODUCTS_INDEX_HEADING = {
  eyebrow: "Products",
  title: "Products we build to solve real problems.",
  description:
    "AROORAA builds its own products across software, AI, mobile, connected environments and operational systems.",
};

/**
 * The frozen four-product portfolio (portfolio-correction milestone).
 * Deliberately richer/differently worded than PRODUCTS_SNAPSHOT in home.ts —
 * this page must not duplicate the homepage's Our Products section (Products
 * Index milestone §15). Status is included only for MESA, reusing its
 * already-approved homepage "Flagship product" label; no status is guessed
 * for the other three (see the milestone completion report).
 */
export const PRODUCTS: ProductSummary[] = [
  {
    id: "mesa",
    name: "MESA",
    positioning: "Restaurant technology ecosystem",
    description:
      "MESA connects dine-in, ordering, kitchen and staff operations into one real-time system — built as multi-tenant SaaS so every restaurant runs its own connected environment.",
    engineeringFocus: [
      "Real-Time Operations",
      "Multi-Tenant SaaS",
      "Order, Kitchen & Staff Systems",
      "Restaurant Intelligence",
    ],
    status: "Flagship product",
    href: "/products/mesa",
  },
  {
    id: "mindra",
    name: "Mindra",
    positioning: "Personal and family second brain",
    description:
      "Mindra explores what a shared second brain could look like for a family — one system for memory, planning and everyday coordination, built across mobile and backend.",
    engineeringFocus: ["Mobile", "Backend Systems", "Shared Information", "Reminders & Planning", "Personal Intelligence"],
    href: "/products/mindra",
  },
  {
    id: "smart-mirror",
    name: "Smart Mirror",
    positioning: "Ambient smart-mirror and edge-computing experience",
    description:
      "Built around Raspberry Pi, voice interaction and edge/local intelligence — Smart Mirror is an early exploration of ambient computing inside an everyday object.",
    engineeringFocus: ["Raspberry Pi", "Voice Interaction", "Edge / Local Computing", "AI", "Ambient Interface"],
    href: "/products/smart-mirror",
  },
  {
    id: "smart-home-eb",
    name: "Arooraa Smart Home",
    positioning: "Connected home energy and electrical intelligence",
    description:
      "Arooraa Smart Home is a local-first, retrofit-friendly prototype exploring how connected systems and automation could bring more intelligence to electrical systems inside the home.",
    engineeringFocus: ["Connected Systems", "Automation", "Electrical / Home Intelligence"],
    href: "/products/smart-home-eb",
  },
];

export const ENGINEERING_BREADTH_CONTENT = {
  eyebrow: "Product Family",
  title: "Different products. Different engineering challenges.",
  domains: [
    { product: "MESA", domain: "SaaS & Operational Systems" },
    { product: "Mindra", domain: "Mobile & Personal Intelligence" },
    { product: "Smart Mirror", domain: "Edge & Ambient Computing" },
    { product: "Arooraa Smart Home", domain: "Connected-Home Systems" },
  ],
};

export const PRODUCTS_CTA_CONTENT = {
  title: "Building your own product? AROORAA can help shape and engineer it.",
  cta: { label: "Start a Project", href: "/start-project" },
};

/* ---------------------------------------------------------------------- */
/* Shared product detail-page template contract (future product pages)    */
/* ---------------------------------------------------------------------- */

export interface ProductTextSection {
  title: string;
  body: string;
}

export interface ProductListSection {
  title: string;
  items: string[];
}

/** A richer list item (name + one line of description), for sections that need more than a flat badge. */
export interface ProductFeatureItem {
  name: string;
  description: string;
}

export interface ProductFeatureSection {
  title: string;
  items: ProductFeatureItem[];
}

export interface ProductCtaAction {
  label: string;
  href: string;
}

/**
 * The frozen ten-part product-story structure (Products Index / Template
 * milestone §7). Hero and cta are always required; the eight middle
 * sections are optional so a product can be populated incrementally without
 * a structural redesign — ProductPageTemplate renders only the sections a
 * given product actually supplies. Hero and CTA actions are generic
 * (usable by any product), not MESA-specific — extended for the MESA
 * flagship page milestone (P2) but not hardcoded to restaurant content.
 */
export interface ProductPageContent {
  id: string;
  name: string;
  hero: {
    eyebrow?: string;
    title: string;
    supporting: string;
    status?: string;
    primaryCta?: ProductCtaAction;
    secondaryCta?: ProductCtaAction;
  };
  whyWeBuiltIt?: ProductTextSection;
  theProblem?: ProductTextSection;
  productVision?: ProductTextSection;
  /** A flagship "see it all together" visual moment (P5.1) — generic, not
   * Smart-Home-specific: any product that wants one especially large
   * illustrative visual bridging Product Vision and What It Does can supply
   * this. Sits between them; optional, like every other middle section. */
  overview?: ProductTextSection;
  whatItDoes?: ProductFeatureSection;
  experience?: ProductTextSection;
  howItWorks?: ProductListSection;
  /** Trust/privacy highlights (P3) — generic, not Mindra-specific: any product with a
   * meaningful privacy/security story can use this, not just Mindra. */
  trust?: ProductListSection;
  engineering?: ProductListSection;
  whereWereGoing?: ProductTextSection;
  cta: {
    title?: string;
    supporting?: string;
    primary: ProductCtaAction;
    secondary?: ProductCtaAction;
  };
}

/**
 * The approved public MESA page content (P2 — MESA Flagship Public Product
 * Page milestone). Sourced from the internal MESA platform reference as a
 * PRIVATE source of truth only — this object deliberately reveals value and
 * positioning while withholding implementation detail (Commerce Core
 * mechanics, service architecture, event/API design, Edge/sync internals,
 * detailed POS/Staff scope, roadmap sequencing, commercial packaging). Status
 * language follows the internal reference's own rule: capabilities still in
 * development or on the roadmap are never described as currently available.
 * AURA is deliberately not mentioned — the internal reference treats the
 * AURA/MESA boundary as non-negotiable, and this page doesn't need to touch
 * it to make its case.
 */
export const MESA_PRODUCT_PAGE: ProductPageContent = {
  id: "mesa",
  name: "MESA",
  hero: {
    eyebrow: "AROORAA FLAGSHIP PRODUCT",
    title: "One restaurant. One connected experience.",
    supporting:
      "MESA brings the customer experience and restaurant operations closer together — helping restaurants move from disconnected tools toward a more connected way of working.",
    status: "Flagship product",
    primaryCta: { label: "Request a Demo", href: "/start-project" },
    secondaryCta: { label: "Explore MESA", href: "#what-it-does" },
  },
  whyWeBuiltIt: {
    title: "Built for the way restaurants actually run.",
    body: "MESA started from a simple observation: restaurants often assemble their technology one tool at a time — a menu here, a billing app there, a kitchen printer, a spreadsheet for reports. Each tool solves a small problem while creating a bigger coordination problem. We're building MESA as a connected alternative for restaurants, cafés, bakeries, bars and lounges, hotels and resorts, and other multi-outlet food businesses — one platform that can grow with the business instead of being replaced by it.",
  },
  theProblem: {
    title: "Restaurants deserve better than disconnected tools.",
    body: "Information often has to move between different systems by hand. Staff end up coordinating the same work more than once. The customer experience can feel disconnected from what's happening in the kitchen and at the counter. And owners are left piecing together the full picture from multiple places instead of seeing one clear view of the business.",
  },
  productVision: {
    title: "Technology should reduce restaurant coordination — not create more of it.",
    body: "We're designing MESA around outcomes that matter to a restaurant: fewer disconnected steps, clearer communication between roles, a more consistent guest experience, and a platform foundation that can evolve as the business does — without needing to be rebuilt along the way.",
  },
  whatItDoes: {
    title: "From customer experience to restaurant operations — designed to work together.",
    items: [
      { name: "Digital Dining", description: "Help restaurants create a smoother digital experience from the table." },
      { name: "Kitchen Coordination", description: "Help kitchen teams receive and manage restaurant work more clearly." },
      { name: "Staff Operations", description: "Support restaurant teams with connected operational experiences." },
      { name: "Billing & Commerce", description: "Bring restaurant commerce closer to the same operational journey." },
      {
        name: "Restaurant Management",
        description: "Give owners and managers a clearer way to configure and understand operations.",
      },
    ],
  },
  experience: {
    title: "A connected service journey.",
    body: "A guest interacts with the restaurant. The restaurant team receives what they need, when they need it. The kitchen stays connected to service. And the business keeps a clearer view of how the operation is actually running — instead of piecing it together after the fact.",
  },
  engineering: {
    title: "Engineered as a platform, not assembled as a collection of screens.",
    items: [
      "Multi-Tenant SaaS",
      "Tenant Isolation",
      "Role-Based Access",
      "Real-Time Experiences",
      "API-First Engineering",
      "Cloud-Ready Architecture",
      "Auditability",
      "Real Data, Not Decorative Metrics",
    ],
  },
  whereWereGoing: {
    title: "Building MESA deliberately.",
    body: "We are building MESA progressively — strengthening the core restaurant journey before expanding into deeper commerce, resilience and integrations. MESA POS and MESA Staff are in active development, extending the same connected experience into counter commerce and day-to-day team operations. Resilient, connectivity-aware operation is part of MESA's long-term direction, alongside carefully governed integrations as the platform grows.",
  },
  cta: {
    title: "See how MESA could fit your restaurant.",
    supporting: "Tell us how your restaurant operates and what you are trying to improve. We'll start from the problem.",
    primary: { label: "Request a Demo", href: "/start-project" },
    secondary: { label: "Talk to AROORAA", href: "/contact" },
  },
};

/**
 * The approved public Mindra page content (P3 — Mindra Public Product Page
 * milestone). Sourced from the internal Mindra product reference as a
 * PRIVATE source of truth only — reveals value and positioning ("a private
 * digital second brain that helps individuals and families capture what
 * matters") while withholding implementation detail (data model, household/
 * user ID scheme, authorization guard mechanics, refresh-token architecture,
 * conflict-handling implementation, hosting/release mechanics, and detailed
 * roadmap sequencing). Every capability listed under `whatItDoes` is a
 * verified-current capability per the internal reference, not a roadmap
 * item — `whereWereGoing` deliberately stays at the "reliable delivery /
 * easier capture / richer workflows" level rather than naming specific
 * platforms, engineering approaches, or a release timeline. Voice and AI are
 * framed as an exploratory future layer, never as available today, per the
 * internal reference's own current-status distinction.
 */
export const MINDRA_PRODUCT_PAGE: ProductPageContent = {
  id: "mindra",
  name: "Mindra",
  hero: {
    eyebrow: "AROORAA PRODUCT",
    title: "Remember less. Live with more clarity.",
    supporting:
      "Mindra helps individuals and families keep important information, tasks, groceries, plans and everyday reminders in one calm, structured place.",
    primaryCta: { label: "Explore Mindra", href: "#what-it-does" },
    secondaryCta: { label: "Start a Project", href: "/start-project" },
  },
  whyWeBuiltIt: {
    title: "Everyday life should not depend on remembering everything.",
    body: "People already have plenty of places to put things — notes for ideas, chats for groceries, memory for tasks, paper for meal plans, calendars for reminders. The problem isn't a lack of tools. It's that everyday information ends up scattered across too many separate places, with nothing holding it together. We built Mindra as one calm, structured place for individuals and families to keep what matters — personal and shared — without losing track of it.",
  },
  theProblem: {
    title: "Important things disappear when they live in too many places.",
    body: "A useful note gets buried and forgotten. A family task loses its owner. A grocery item gets lost in a chat thread. A reminder lives apart from the information it actually belongs to. And family planning ends up depending on memory and the same conversations happening again and again.",
  },
  productVision: {
    title: "One calm place for personal memory and family coordination.",
    body: "Mindra is designed around a simple idea: private personal information and shared family information should be structured, easy to find, and clearly separated. Not one more noisy feed to check — one calm place to remember, organize, assign, plan, share and revisit what matters.",
  },
  whatItDoes: {
    title: "Everything Mindra helps you keep track of.",
    items: [
      {
        name: "Personal Memory",
        description: "Save notes, ideas, decisions, tasks and useful references in one private place.",
      },
      {
        name: "Search & Organize",
        description: "Find information later without depending on memory alone.",
      },
      {
        name: "Family Coordination",
        description: "Keep shared household information visible and structured.",
      },
      {
        name: "Shared Tasks",
        description: "Assign and track household work as a family.",
      },
      {
        name: "Groceries",
        description: "Maintain a shared grocery list with item-level progress.",
      },
      {
        name: "Meal Planning",
        description: "Plan meals across the week and see what's relevant today.",
      },
      {
        name: "Today",
        description: "Bring the day's useful information together in one place.",
      },
    ],
  },
  howItWorks: {
    title: "Private when it should be. Shared when it needs to be.",
    items: ["My Space", "Family Space"],
  },
  experience: {
    title: "One calm rhythm, from morning to evening.",
    body: "In the morning, check today's plan, see what needs attention, and know what's for dinner. During the day, capture an idea, add something to the grocery list, or assign a task to someone at home. In the evening, review what got done, adjust tomorrow's plan, and keep anything useful for later. Mindra fits around the day — not the other way around.",
  },
  trust: {
    title: "Personal information should stay personal.",
    items: [
      "Private Personal Space",
      "Household-Scoped Sharing",
      "Authenticated Access",
      "Secure Session Handling",
      "Clear Personal / Family Separation",
      "No Accidental Cross-Household Access",
    ],
  },
  engineering: {
    title: "Built as a real mobile product, not a browser wrapper.",
    items: [
      "Native Mobile Experience",
      "React Native / Expo",
      "Spring Boot Backend",
      "PostgreSQL",
      "Next.js Web Foundation",
      "Secure Authentication",
      "Household-Scoped Authorization",
      "Android & iOS Codebase",
      "Conflict-Safe Shared Updates",
    ],
  },
  whereWereGoing: {
    title: "Making capture easier without making the product noisier.",
    body: "We're focused on making Mindra steadier and easier to use day to day: more reliable reminder delivery, richer family workflows, and continued refinement of the mobile experience. We're also exploring faster ways to capture information, including tap-to-speak and natural-language actions. Over time, Mindra is being designed to become more helpful through natural-language capture and intelligent retrieval — while keeping structured information and privacy at the center.",
  },
  cta: {
    title: "Have an idea that should be easier to live with?",
    supporting:
      "Mindra started from a simple everyday problem. If you're exploring a product idea of your own, AROORAA can help shape and engineer it.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Our Products", href: "/products" },
  },
};

/**
 * The approved public Smart Mirror page content (P4 — Smart Mirror Public
 * Product Page milestone). Sourced from the internal Magic Mirror product
 * reference as a PRIVATE source of truth only — the reference itself is
 * explicit that this must publish as an upcoming product with a realistic
 * roadmap, not as production-ready technology. Public name is "Smart
 * Mirror" throughout (never "M²", never "Magic Mirror" as the primary
 * public name). `whatItDoes` deliberately covers only 6 broad human-facing
 * groups, not the internal reference's 22-part functional vision, and its
 * title itself signals "concept and prototype direction" rather than
 * shipped capability. Voice, face recognition and wellness all use the
 * reference's own safe public wording — never presented as complete,
 * accurate, or medically validated. Withheld: hardware BOM, full functional
 * roadmap, recognition/vision pipeline internals, edge/cloud service
 * topology, integration vendor strategy, phase numbering, success metrics,
 * commercial-extension detail. "Home Intelligence" (brief's own §8) has no
 * dedicated template slot beyond the 9 already used by other sections, so
 * it's folded into the `whatItDoes` tile and a brief mention in
 * `whereWereGoing` rather than forcing an unsupported new slot.
 */
export const SMART_MIRROR_PRODUCT_PAGE: ProductPageContent = {
  id: "smart-mirror",
  name: "Smart Mirror",
  hero: {
    eyebrow: "AROORAA PRODUCT · COMING SOON",
    title: "The mirror that understands your day.",
    supporting:
      "Smart Mirror explores how personal intelligence, family coordination and connected-home information can become part of an everyday object — available when useful, quiet when not.",
    status: "Coming Soon",
    primaryCta: { label: "Explore the Vision", href: "#what-it-does" },
    secondaryCta: { label: "Start a Project", href: "/start-project" },
  },
  whyWeBuiltIt: {
    title: "Technology should appear when it helps — and disappear when it doesn't.",
    body: "People already pass a mirror naturally — getting ready in the morning, before leaving home, coming back, before bed. Those are natural moments where useful information could appear without asking anyone to open another device. Smart Mirror is our exploration of reducing that everyday digital friction, not adding another screen to check.",
  },
  theProblem: {
    title: "Everyday information lives in too many places.",
    body: "A calendar sits in one app, reminders in another, family information in a chat thread, smart-home devices in their own vendor apps, and wellness data somewhere else entirely. And even with all of it connected, most smart homes are still too operationally complicated to feel effortless.",
  },
  productVision: {
    title: "Ambient intelligence for everyday life.",
    body: "Smart Mirror is our exploration of computing that becomes part of the environment — personalized to the person in front of it, connected to the household around it, and quiet when it has nothing useful to say.",
  },
  whatItDoes: {
    title: "What Smart Mirror can become — our concept and prototype direction.",
    items: [
      {
        name: "Personal Intelligence",
        description: "A daily briefing, reminders and questions answered, without reaching for a phone.",
      },
      {
        name: "Family Coordination",
        description: "Shared reminders, calendar context and household tasks the whole family can see.",
      },
      {
        name: "Wellness",
        description: "Glanceable wellness information and reminders, where supported.",
      },
      {
        name: "Home Intelligence",
        description: "Connected-home status, simple routines and useful energy awareness in one place.",
      },
      {
        name: "Household Memory",
        description: "Useful household knowledge, notes and lists the mirror can help you remember.",
      },
      {
        name: "Security & Awareness",
        description: "Selected home-security information and alerts, where supported.",
      },
    ],
  },
  experience: {
    title: "A morning with Smart Mirror.",
    body: "A person approaches the mirror, and it shows only what matters — the time, the weather, the first meeting, one important reminder, one family item. They can ask, “What do I need to know today?” Glance, ask, act, and return to the reflection. Planned voice interaction is designed to make this hands-free.",
  },
  howItWorks: {
    title: "Personal when it should be. Shared when it needs to be.",
    items: ["My Space", "Family Space"],
  },
  trust: {
    title: "Intelligence in the home should come with visible privacy controls.",
    items: [
      "Visible Camera & Microphone State",
      "User-Controlled Privacy",
      "Private vs Shared Information",
      "Guest & Restricted Experiences",
      "Local Processing Where Appropriate",
      "No Always-On Assumption",
    ],
  },
  engineering: {
    title: "Where software meets the physical environment.",
    items: [
      "Raspberry Pi 5 / Edge Platform",
      "Edge & Local Computing",
      "Voice Interaction Direction",
      "React-Based Interface",
      "Local AI Experimentation",
      "Connected-Device Integration",
      "Privacy-Aware Processing",
      "Hybrid Edge/Cloud Direction",
    ],
  },
  whereWereGoing: {
    title: "Building the intelligence first. The mirror is the first interface.",
    body: "We're starting with the prototype direction: a polished mirror UI, daily information, personalization, voice interaction, basic home integration and visible privacy controls. Next comes richer family and shared experiences, deeper household knowledge, selected energy and home intelligence, and closer connections with Mindra. The long-term vision is richer ambient intelligence, carefully validated wellness experiences, and selected commercial variants — built only once the home experience is proven.",
  },
  cta: {
    title: "Interested in where ambient computing is going?",
    supporting:
      "Smart Mirror is one of the ways AROORAA is exploring products that blend software, AI and the physical environment.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Our Products", href: "/products" },
  },
};

/**
 * P5 — Arooraa Smart Home. Public name is "Arooraa Smart Home"; the route
 * stays /products/smart-home-eb for continuity with the existing Products
 * Index/footer link. Compressed from an internal ~20-section product-vision
 * and prototype reference into the template's nine optional slots, each
 * chosen to match its slot's fixed eyebrow: Energy (the source's own
 * strongest-emphasis story) sits in `theProblem`, Local-first + retrofit in
 * `productVision`, Manual Control in `experience`, Water (explicitly a
 * planned-expansion beat, lower priority than Energy/Control/Safety) in
 * `howItWorks`, Safety in `trust` (a direct match for "Privacy & Trust"),
 * and the prototype journey in `whereWereGoing`. Deliberately withheld:
 * hardware BOM, CT/meter ratios, DB/panel layouts, protection coordination,
 * exact protocol topology (MQTT/Modbus/Home-Assistant internals), vendor
 * names, phase numbers 0–7, and any savings/production claims not yet
 * validated — matching the source document's own explicit publishing rule.
 */
export const SMART_HOME_PRODUCT_PAGE: ProductPageContent = {
  id: "smart-home-eb",
  name: "Arooraa Smart Home",
  hero: {
    eyebrow: "AROORAA PRODUCT · PROTOTYPE IN DEVELOPMENT",
    title: "A smarter home should keep working — even when the internet does not.",
    supporting:
      "Arooraa Smart Home explores a local-first way to understand energy, coordinate selected home systems and improve household reliability — while keeping manual control in the hands of the people who live there.",
    status: "Prototype / In Development",
    primaryCta: { label: "Explore the Product Vision", href: "#what-it-does" },
    secondaryCta: { label: "Start a Project", href: "/start-project" },
  },
  whyWeBuiltIt: {
    title: "A smart home should solve household problems — not create new ones.",
    body: "Homes increasingly contain isolated smart devices, but families still deal with unclear electricity usage, multiple control apps, pumps and tanks that depend on someone remembering to check them, cloud-only devices that stop working when connectivity fails, fragmented safety information, and installations that take away the manual control people are used to. Arooraa Smart Home is our exploration of a dependable home layer that solves these problems together, instead of adding one more disconnected app.",
  },
  theProblem: {
    title: "Most homes see the bill. They don't see what created it.",
    body: "Electricity bills rise without circuit-level explanation or early warning. The prototype direction focuses on making electricity usage easier to understand and act on — current load, today's consumption, estimated cost, and which circuits matter most — so a household can notice unusual usage before it becomes a surprise.",
  },
  productVision: {
    title: "The home should keep working when the cloud doesn't.",
    body: "Essential controls and safety alarms run inside the home, not in the cloud. Physical switches stay usable. Remote access, history and intelligence can use optional cloud services, but a cloud outage should only reduce convenience, never basic home operation. Arooraa Smart Home is also retrofit-first — designed to adopt gradually into existing homes rather than requiring complete rewiring. Retrofit suitability depends on the home's electrical and installation conditions.",
  },
  overview: {
    title: "See the home as one connected environment.",
    body: "Instead of thinking about devices one by one, Arooraa Smart Home explores a room-by-room and home-wide view of what is happening — from comfort and energy to water and safety.",
  },
  whatItDoes: {
    title: "What Arooraa Smart Home can become — our prototype focus and planned expansion.",
    items: [
      {
        name: "Smart Energy",
        description: "Understand consumption and spot unusual usage before it becomes a surprise. Part of the current prototype focus.",
      },
      {
        name: "Smart Control",
        description:
          "Coordinate selected lights, fans and approved loads without losing manual control. Part of the current prototype focus.",
      },
      {
        name: "Smart Water",
        description: "Monitor tank levels and protect water-motor operation. Planned expansion once the energy foundation is proven.",
      },
      {
        name: "Smart Safety",
        description: "Surface smoke, LPG and water-leak information with local-first alerting. Beginning within the current prototype focus.",
      },
      {
        name: "Smart Security",
        description: "Bring selected door, motion and camera information into one household view. Planned expansion alongside water protection.",
      },
      {
        name: "Home Care",
        description: "Keep useful maintenance, warranty and renewal information easier to track. Longer-term direction.",
      },
    ],
  },
  experience: {
    title: "Automation should never remove normal control.",
    body: "Smart control should add convenience without making the home dependent on an app. Selected lights, fans and sockets can follow schedules and scenes, but physical wall switches keep working exactly as they always have, and a safe manual override is always available.",
  },
  howItWorks: {
    title: "Water systems should not depend on someone remembering to check the tank. Planned expansion after the energy foundation.",
    items: ["Tank-Level Visibility", "Protected Motor Automation", "Overflow Prevention", "Dry-Run Protection", "Manual Override"],
  },
  trust: {
    title: "Safety is not an optional feature.",
    items: [
      "Certified Mains Equipment Required",
      "Qualified Electrician Required",
      "Manual Override Retained",
      "Local Alarms For Safety-Critical Detection",
      "Fail-Safe Behavior Required",
      "Low-Voltage Prototype Work Isolated From Mains",
    ],
  },
  engineering: {
    title: "Built from the home inward.",
    items: [
      "Raspberry Pi 5 / Local Gateway",
      "ESP32 Low-Voltage Prototyping",
      "Local-First Processing",
      "Zigbee Device Direction",
      "Energy-Meter Integration Direction",
      "Secure Mobile Experience",
      "Optional Cloud History & Remote Access",
      "Modular Backend & API Evolution",
    ],
  },
  whereWereGoing: {
    title: "Start with one room. Prove the system. Expand only when it earns trust.",
    body: "We're starting with the prototype direction: one smart room, whole-home energy visibility, retained manual control and useful alerts, run through a real reliability pilot before anything expands. Next comes water protection and selected safety integrations, proven room by room. The longer-term direction is broader home coordination, deeper maintenance intelligence, and carefully governed AI assistance — intelligence that can help explain usage and suggest actions, without ever replacing manual control or safety behavior. Arooraa Smart Home can eventually share selected home and energy context with other AROORAA experiences such as Smart Mirror, without either product depending on the other.",
  },
  cta: {
    title: "Thinking about a smarter home — or a connected product of your own?",
    supporting:
      "Arooraa Smart Home is one way we're exploring how software, IoT and physical systems can solve everyday problems more reliably.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Our Products", href: "/products" },
  },
};
