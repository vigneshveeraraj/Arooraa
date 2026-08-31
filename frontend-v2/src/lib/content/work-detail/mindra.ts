/**
 * Content for /our-work/mindra (W2.2) — the second Our Work engineering
 * story. Deliberately its own file, separate from lib/content/products.ts
 * (the approved public Mindra product page) and lib/content/our-work.ts
 * (the index page's summary content) — this page tells neither of those
 * stories again. It explains why AROORAA built Mindra, what product
 * decisions shaped it and what building it demonstrates — not what Mindra
 * does feature-by-feature (that's the product page's job).
 *
 * Public-truth boundary (per the W2.2 brief): only the following are
 * described as current, working product areas — Notes, Tasks, Bookmarks,
 * Contacts, pin/unpin, archive/restore, search/filters, My Space, Family
 * Space, household/family coordination, groceries, meal planning, Today,
 * the web and mobile apps, authentication/private access, and the
 * personal-vs-shared distinction. Voice capture, natural-language
 * interaction, deeper AI assistance, automated insurance comparison,
 * automatic policy purchase and autonomous actions are all explicitly
 * future direction/exploration, never presented as shipped.
 */

export interface MindraChapterHeading {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  supporting?: string;
}

/**
 * The hero headline intentionally reuses the approved /products/mindra
 * headline verbatim (the W2.2 brief's own "Preferred" wording) — a short
 * signature line, not the large body copy the product page is built from,
 * so this isn't the "large copy duplication" that section 17 warns against.
 */
export const MINDRA_STORY_HERO = {
  eyebrow: "AROORAA PRODUCT STORY · MINDRA",
  title: "Remember less. Live with more clarity.",
  supporting:
    "Life creates more information, responsibilities, plans and small things to remember than our minds should have to carry. Mindra brings personal memory, everyday responsibilities and deliberately shared family life into one calm space across mobile and web.",
  maturityLabel: "WORKING PRODUCT · MVP",
  primaryCta: { label: "Explore Mindra", href: "/products/mindra" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export const HERO_FRAGMENT_KINDS = ["Note", "Task", "Link", "Grocery", "Plan", "Reminder", "Contact", "Meal"];

export const CHAPTER_FRAGMENTED_DAY: MindraChapterHeading = {
  id: "fragmented-day",
  index: "01",
  eyebrow: "The Original Observation",
  title: "The problem was not remembering one thing. It was remembering everything in different places.",
  supporting: "The mental load often lives in the gaps between tools.",
};

export const FRAGMENTED_DAY_ITEMS = ["Notes", "Tasks", "Saved Links", "Groceries", "Family Plans", "Reminders"];

export const CHAPTER_CAPTURE_CONTEXT: MindraChapterHeading = {
  id: "capture-context",
  index: "02",
  eyebrow: "From Storage To Context",
  title: "Mindra became more useful when we stopped treating memory as a list of notes.",
};

export const CAPTURE_STAGES = ["Capture", "Organize", "Return When Useful"];
export const CAPTURE_EXAMPLES = ["Note", "Task", "Bookmark", "Contact"];

export const CHAPTER_SPACES: MindraChapterHeading = {
  id: "spaces",
  index: "03",
  eyebrow: "Two Kinds Of Memory",
  title: "Personal life and shared family life need different boundaries.",
  supporting: "Private by default. Shared by choice.",
};

export const SPACES_PRINCIPLE = "Sharing should be deliberate, not the automatic consequence of using the same application.";

export interface MindraSpace {
  name: string;
  description: string;
}

export const SPACES: MindraSpace[] = [
  { name: "My Space", description: "Private personal memory, personal work and individual information." },
  { name: "Family Space", description: "Selected information intentionally shared for household coordination." },
];

export const CHAPTER_NATURAL_CAPTURE: MindraChapterHeading = {
  id: "natural-capture",
  index: "04",
  eyebrow: "Designing For Capture",
  title: "The first job of a second brain is to make capture feel natural.",
};

export const CAPTURE_TYPES = ["Notes", "Tasks", "Bookmarks", "Contacts"];
export const PERSONAL_WORK_EXAMPLES = ["Ideas", "Research", "Things to revisit", "Personal projects", "Follow-ups", "Learning notes", "Useful links"];
export const FUTURE_CAPTURE_LABEL = "Future direction";
export const FUTURE_CAPTURE_ITEM = "Voice capture";

export const CHAPTER_TODAY: MindraChapterHeading = {
  id: "today",
  index: "05",
  eyebrow: "The Day, Brought Together",
  title: "A second brain should not only store information. It should help with today.",
};

export interface TodayBentoItem {
  label: string;
  description: string;
}

export const TODAY_BENTO: TodayBentoItem[] = [
  { label: "Today", description: "What needs attention, right now." },
  { label: "Tasks", description: "What's yours to do, and what's shared." },
  { label: "Grocery", description: "What the household still needs." },
  { label: "Meal Plan", description: "What's planned for the days ahead." },
  { label: "Notes", description: "What's worth remembering later." },
  { label: "Family", description: "What everyone else needs to see." },
];

export const CHAPTER_DAY_WITH_MINDRA: MindraChapterHeading = {
  id: "day-with-mindra",
  index: "06",
  eyebrow: "Family Life, In Small Decisions",
  title: "Family coordination is made of hundreds of small decisions.",
  supporting: "What should we buy? What are we cooking? What needs to get done? Who already handled it?",
};

export interface DayMoment {
  time: string;
  label: string;
  description: string;
}

export const DAY_MOMENTS: DayMoment[] = [
  { time: "Morning", label: "Today", description: "The day opens with what actually needs attention." },
  { time: "Midday", label: "Capture", description: "A task or a note, captured on the go, in My Space." },
  { time: "Afternoon", label: "Grocery", description: "An item goes on the shared list before it's forgotten." },
  { time: "Afternoon", label: "Family Space", description: "A household update becomes visible to everyone who needs it." },
  { time: "Evening", label: "Meal Plan", description: "Tonight's plan gets reviewed, not reinvented." },
  { time: "Evening", label: "Handled", description: "A task closes. A memory worth keeping stays." },
];

export const CHAPTER_LIFE_MAINTENANCE: MindraChapterHeading = {
  id: "life-maintenance",
  index: "07",
  eyebrow: "The Cycles Around Life",
  title: "Life is full of things that matter occasionally — and are easy to remember too late.",
  supporting: "These do not need attention every day — which is why they are easy to miss.",
};

export const LIFE_MAINTENANCE_PRINCIPLE = "You live your life. Mindra quietly remembers the cycles around it.";

export interface MaintenanceGroup {
  name: string;
  items: string[];
}

export const MAINTENANCE_GROUPS: MaintenanceGroup[] = [
  {
    name: "Vehicle",
    items: ["Bike/car insurance renewal", "Bike service", "Car service", "Oil change", "Free-service reminder", "Other vehicle-care cycles"],
  },
  {
    name: "Home",
    items: ["AC service", "Appliance maintenance", "Filter/service cycles", "Other recurring household maintenance"],
  },
  {
    name: "Personal",
    items: ["Haircut", "Grooming", "Nail care", "Other routines chosen by the user"],
  },
  {
    name: "Renewals",
    items: ["Policies", "Subscriptions", "Recurring documents, where appropriate"],
  },
];

export const MAINTENANCE_CONCEPT_LABEL = "Concept direction";

export const INSURANCE_FUTURE_DIRECTION =
  "Mindra could eventually help prepare a renewal decision by remembering the expiry, surfacing existing policy context, and helping compare available options. It would not automatically buy insurance, automatically choose the best policy, guarantee a market comparison, or give regulated financial advice — the person stays in control of the decision.";

export const SERVICE_CONTACT_FUTURE_DIRECTION =
  "Mindra can retain a preferred service provider and could surface verified provider information where reliable sources are available — not a promise that every contact detail will always be automatically correct.";

export const CHAPTER_MOBILE_WEB: MindraChapterHeading = {
  id: "mobile-web",
  index: "08",
  eyebrow: "One Memory, Many Devices",
  title: "Your second brain should follow you — not the device you used to capture it.",
};

export const MOBILE_WEB_PRINCIPLE = "One Mindra. One memory. Available across your devices.";

export const MOBILE_USES = ["Quick capture", "Today", "Reminders", "Family coordination", "Information away from home"];
export const WEB_USES = ["Longer notes", "Planning", "Organizing", "Reviewing larger collections", "Keyboard-oriented work"];

export const CHAPTER_TRUST_PRIVACY: MindraChapterHeading = {
  id: "trust-privacy",
  index: "09",
  eyebrow: "Earning Trust",
  title: "A second brain is only useful if people can trust what they put inside it.",
};

export const TRUST_PRINCIPLES = [
  "Authenticated access",
  "Personal and private boundaries",
  "Deliberate Family Space sharing",
  "Secure personal memory",
  "Safe access across devices",
  "User control over what becomes shared",
];

export const CHAPTER_ENGINEERING_FOUNDATION: MindraChapterHeading = {
  id: "engineering-foundation",
  index: "10",
  eyebrow: "Engineering Beneath Calm",
  title: "The interesting engineering started after the product idea became simple.",
};

export const FOUNDATION_LAYERS = ["Identity", "Personal / Shared Boundaries", "Search", "APIs", "Sync / State", "Notifications"];

export const FUTURE_DIRECTION_TITLE = "The direction is a second brain that becomes more helpful without becoming more intrusive.";

export const NOW_ITEMS = [
  "Notes",
  "Tasks",
  "Bookmarks",
  "Contacts",
  "My Space",
  "Family Space",
  "Groceries",
  "Meal Planning",
  "Today",
  "Mobile + Web",
];

export const FUTURE_ITEMS = [
  "Richer voice interaction",
  "Natural-language capture",
  "Contextual assistance",
  "AI-supported retrieval / organization",
  "Proactive help where appropriate",
];

export const MINDRA_STORY_CLOSING = {
  title: "Mindra started with a simple question: what should we stop forcing ourselves to remember?",
  supporting:
    "We are building toward a calmer way to capture, organize and use the information, responsibilities and everyday context that support personal and family life.",
};

export const CLOSING_PRINCIPLE = "The person is the center. Mindra quietly supports the information around them.";

export const ORBIT_ITEMS = ["Memory", "Task", "Plan", "Family", "Maintenance", "Useful Knowledge"];

export const MINDRA_STORY_RELATED_LINKS = [
  { label: "Explore Mindra", href: "/products/mindra" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "Product Discovery", href: "/services/product-discovery" },
  { label: "Start a Project", href: "/start-project" },
];

export const MINDRA_STORY_FINAL_CTA = {
  title: "Have an everyday problem that deserves a calmer product?",
  supporting: "Start with what people are forced to remember today. We can help design and build the product that carries it for them.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Explore Mindra", href: "/products/mindra" },
};
