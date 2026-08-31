/**
 * Content for /our-work/smart-home (W2.4) — the fourth Our Work engineering
 * story. Deliberately its own file, separate from lib/content/products.ts
 * (the approved public product page at /products/smart-home-eb, whose route
 * name stays unchanged) and lib/content/our-work.ts (the index page's
 * summary content) — this page explains why AROORAA explored a local-first
 * smart home and what building the prototype demonstrates, not a feature
 * list. Public product name used throughout: "Arooraa Smart Home."
 *
 * Public-truth boundary (per the W2.4 brief): Arooraa Smart Home is a
 * prototype / product direction — nothing on this page implies complete
 * commercial deployment, a fully automated villa already in production,
 * certified electrical product status, autonomous mains control without
 * safeguards, automatic insurance purchasing, guaranteed service-provider
 * data, AI replacing deterministic safety, or a whole-home installation
 * already completed.
 */

export const SMART_HOME_STORY_HERO = {
  eyebrow: "AROORAA PRODUCT STORY · SMART HOME",
  title: "A smarter home should keep working — even when the internet does not.",
  supporting:
    "Arooraa Smart Home explores how local control, energy visibility, practical automation and household awareness can make a home easier to understand and operate without making everyday life more fragile.",
  maturityLabel: "AROORAA PRODUCT · PROTOTYPE DIRECTION",
  primaryCta: { label: "Explore Arooraa Smart Home", href: "/products/smart-home-eb" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export interface SmartHomeChapterHeading {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  supporting?: string;
}

/* Chapter 01 — The real problem */

export const CHAPTER_REAL_PROBLEM: SmartHomeChapterHeading = {
  id: "real-problem",
  index: "01",
  eyebrow: "THE REAL PROBLEM",
  title: "The problem was not switching one light from a phone.",
  supporting: "Remote control is useful. Understanding and reliability are more valuable.",
};

export const HOUSEHOLD_CONCERNS = ["Lights", "AC", "Energy", "Water", "Maintenance", "Safety", "Routines", "Rooms"];

/* Chapter 02 — Normal home first */

export const CHAPTER_NORMAL_HOME: SmartHomeChapterHeading = {
  id: "normal-home",
  index: "02",
  eyebrow: "A NON-NEGOTIABLE PRINCIPLE",
  title: "A smart home should still feel like a normal home.",
  supporting: "The system should support ordinary behaviour instead of replacing it.",
};

export const NORMAL_HOME_KEY_LINE = "Technology should add capability without removing familiarity.";

export interface HomeState {
  name: string;
  description: string;
}

export const HOME_STATES: HomeState[] = [
  { name: "Normal Home", description: "Switches and routines work exactly as they always have." },
  { name: "Smart Assist", description: "Automation quietly helps when it is useful." },
  { name: "Offline / Local Continuity", description: "Connectivity drops. Local control keeps working." },
];

/* Chapter 03 — Local first */

export const CHAPTER_LOCAL_FIRST: SmartHomeChapterHeading = {
  id: "local-first",
  index: "03",
  eyebrow: "LOCAL FIRST",
  title: "We made local control the foundation, not an optional layer.",
  supporting: "Connected services can improve remote visibility, richer coordination and future intelligence — but should not become the single dependency for normal operation.",
};

export const LOCAL_FIRST_STAGES = ["Rooms / Devices", "Local Home Layer", "External / Cloud Services"];
export const LOCAL_FIRST_CLOUD_NOTE = "Optional and supporting — never the single dependency for normal operation.";

/* Chapter 04 — Energy visibility */

export const CHAPTER_ENERGY_VISIBILITY: SmartHomeChapterHeading = {
  id: "energy-visibility",
  index: "04",
  eyebrow: "ENERGY VISIBILITY",
  title: "Most homes see the bill. They do not see what created it.",
  supporting: "Energy becomes more useful when it is connected to the room and behaviour that created it.",
};

export const ENERGY_CONCEPT_LABEL = "Energy experience concept";
export const ENERGY_VISIBILITY_ITEMS = ["Which room is consuming more", "Which major loads are active", "How usage changes over time", "Where attention may be useful"];

/* Chapter 05 — Expand carefully */

export const CHAPTER_EXPAND_CAREFULLY: SmartHomeChapterHeading = {
  id: "expand-carefully",
  index: "05",
  eyebrow: "ROOM-BY-ROOM CONFIDENCE",
  title: "Start with one room. Prove reliability. Expand carefully.",
};

export const EXPANSION_STAGES = ["Bedroom", "Living Room", "Kitchen", "Utility / Water Context", "Wider Home"];
export const EXPANSION_PROOF_POINTS = ["Reliability", "Usability", "Manual Compatibility", "Visibility", "Safety"];

/* Chapter 06 — Manual control */

export const CHAPTER_MANUAL_CONTROL: SmartHomeChapterHeading = {
  id: "manual-control",
  index: "06",
  eyebrow: "MANUAL CONTROL",
  title: "Automation should never remove normal control.",
};

export const MANUAL_CONTROL_CONCEPT_LABEL = "Control experience concept";
export const MANUAL_CONTROL_KEY_LINE = "Smart when helpful. Manual when needed.";
export const MANUAL_CONTROL_ITEMS = [
  "Normal physical switches remain meaningful",
  "Automation coexists with manual action",
  "User control stays obvious",
  "The household is never trapped inside an app",
];

/* Chapter 07 — Home resources and recurring life maintenance */

export const CHAPTER_HOME_RESOURCES: SmartHomeChapterHeading = {
  id: "home-resources",
  index: "07",
  eyebrow: "HOME RESOURCES",
  title: "A home has more to remember than electrical loads.",
};

export const RESOURCES_CONCEPT_LABEL = "Household awareness concept";
export const RESOURCE_AWARENESS_ITEMS = ["Water tank level awareness", "Household resource visibility", "Maintenance reminders", "Appliance service cycles"];

export interface MaintenanceGroup {
  name: string;
  items: string[];
}

export const MAINTENANCE_GROUPS: MaintenanceGroup[] = [
  { name: "Vehicle", items: ["Bike insurance renewal", "Car insurance renewal", "Bike oil change", "Bike service", "Car service", "Free-service reminders"] },
  { name: "Home", items: ["AC servicing", "Filter replacement", "Appliance maintenance", "Other household service cycles"] },
  { name: "Personal", items: ["Haircut / grooming reminder", "Nail care reminder", "Other user-defined personal routines"] },
];

export const MAINTENANCE_FRAMING_NOTE = "This is the broader household awareness / life-maintenance layer around the home experience — not an electrical Smart Home function.";

export const INSURANCE_FUTURE_DIRECTION =
  "A future experience could remember renewal dates, retain policy context and help prepare the user to compare available options. It would not automatically purchase insurance, automatically select the “best” policy, guarantee a market comparison or provide regulated financial advice — the person stays in control of the decision.";

export const SERVICE_CONTACT_FUTURE_DIRECTION =
  "The system could retain preferred service contacts or surface verified provider information where reliable sources are available — not a guarantee that every phone number or contact detail will always be correct.";

/* Chapter 08 — Retrofit reality */

export const CHAPTER_RETROFIT: SmartHomeChapterHeading = {
  id: "retrofit",
  index: "08",
  eyebrow: "RETROFIT REALITY",
  title: "A smarter home has to fit the home that already exists.",
  supporting: "Modernization should adapt to the home, not assume the home was designed around the technology.",
};

export const RETROFIT_STAGES = ["Existing Home", "Selected Upgrade Areas", "Smart Layer Added Carefully"];
export const RETROFIT_CONSIDERATIONS = ["Existing electrical infrastructure", "Room differences", "Daily routines", "Installation limitations", "Current switches and controls", "Staged upgrades"];

/* Chapter 09 — Safety */

export const CHAPTER_SAFETY: SmartHomeChapterHeading = {
  id: "safety",
  index: "09",
  eyebrow: "SAFETY",
  title: "Safety is not a feature. It is the boundary for everything else.",
};

export const SAFETY_PRINCIPLES = [
  "Rated and certified equipment where required",
  "Qualified electrician for electrical work",
  "Proper isolation",
  "Manual override, always available",
  "Fail-safe behaviour",
  "Controlled, deliberate automation",
  "Clear separation between low-voltage experimentation and household mains",
  "Validation before expansion",
];

/* Chapter 10 — Engineering foundation */

export const CHAPTER_ENGINEERING_FOUNDATION: SmartHomeChapterHeading = {
  id: "engineering-foundation",
  index: "10",
  eyebrow: "ENGINEERING FOUNDATION",
  title: "The intelligence layer should come after reliability.",
};

export const ENGINEERING_LAYERS = ["Home Experience", "Local Control & Visibility", "Edge Gateway", "Physical Home"];
export const ENGINEERING_INTELLIGENCE_NOTE = "Intelligence sits as an optional later layer above this reliable foundation.";

export const RASPBERRY_PI_FRAMING =
  "The prototype direction uses Raspberry Pi 5 as an edge gateway foundation for early experimentation. ESP32-based experiments remain limited to appropriate low-voltage contexts and do not imply a finished household-mains design.";

/* Chapter 11 — Intelligence after reliability */

export const CHAPTER_INTELLIGENCE: SmartHomeChapterHeading = {
  id: "intelligence",
  index: "11",
  eyebrow: "INTELLIGENCE",
  title: "A home should become intelligent only after it becomes dependable.",
};

export const INTELLIGENCE_KEY_LINE = "AI should never replace deterministic safety, manual control or clearly defined electrical behaviour.";
export const INTELLIGENCE_ITEMS = [
  "Understanding energy patterns",
  "Highlighting unusual usage",
  "Suggesting maintenance",
  "Helping prioritize household actions",
  "Summarising what changed",
  "Supporting routines",
];
export const INTELLIGENCE_STAGES = ["Reliable Home", "Observations", "Suggestions"];
export const INTELLIGENCE_FINAL_NOTE = "The human remains the final decision point.";

/* Chapter 12 — Prototype journey */

export const CHAPTER_PROTOTYPE_JOURNEY: SmartHomeChapterHeading = {
  id: "prototype-journey",
  index: "12",
  eyebrow: "PROTOTYPE JOURNEY",
  title: "Prove the home one step at a time.",
};

export const JOURNEY_STAGES = [
  "Understand the home",
  "Prove local reliability",
  "Make energy visible",
  "Add manual-compatible automation",
  "Expand carefully",
  "Introduce broader household awareness",
  "Explore intelligence only where useful",
];

/* Chapter 13 — Whole-home synthesis */

export const CHAPTER_WHOLE_HOME: SmartHomeChapterHeading = {
  id: "whole-home",
  index: "13",
  eyebrow: "ONE CONNECTED ENVIRONMENT",
  title: "The goal is not a collection of smart devices. It is a home that makes more sense as a whole.",
};

export const WHOLE_HOME_CONCEPT_LABEL = "Whole-home concept visualization";
export const WHOLE_HOME_THREADS = ["Room awareness", "Energy", "Comfort", "Lighting", "Resources", "Maintenance", "Local reliability", "Gradual coordination"];

/* Chapter 14 — Current vs future */

export const CHAPTER_CURRENT_VS_FUTURE: SmartHomeChapterHeading = {
  id: "current-vs-future",
  index: "14",
  eyebrow: "PRODUCT DIRECTION",
  title: "The prototype proves a direction. It does not pretend the entire home is finished.",
};

export const CURRENT_LABEL = "Prototype / Current Exploration";
export const CURRENT_ITEMS = [
  "Local-first control direction",
  "Room-level pilot",
  "Energy visibility concepts",
  "Manual-control coexistence",
  "Raspberry Pi 5 gateway experimentation",
  "ESP32 low-voltage experimentation",
  "Water / resource concept exploration",
];

export const FUTURE_LABEL = "Future Direction";
export const FUTURE_ITEMS = [
  "Wider room / device coverage",
  "Richer household maintenance",
  "Service / renewal intelligence",
  "More advanced energy interpretation",
  "Deeper smart-home coordination",
  "Carefully bounded AI assistance",
];

/* Closing */

export const SMART_HOME_STORY_CLOSING = {
  title: "A connected home should become more useful without becoming more fragile.",
  supporting: "The goal of Arooraa Smart Home is not to fill a house with technology. It is to make everyday living easier to understand, easier to operate and more dependable over time.",
};

export const CLOSING_PRINCIPLE = "The smartest home may be the one that quietly works the way people already expect a home to work.";

export const SMART_HOME_STORY_RELATED_LINKS = [
  { label: "Explore Arooraa Smart Home", href: "/products/smart-home-eb" },
  { label: "Cloud & Platform Engineering", href: "/services/cloud-platform" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "Start a Project", href: "/start-project" },
];

export const SMART_HOME_STORY_FINAL_CTA = {
  title: "Have a home, building or environment that deserves calmer engineering?",
  supporting: "Start with the room, the routine or the risk — not the gadget list. We can help explore where local control, visibility and careful automation actually belong.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Explore Arooraa Smart Home", href: "/products/smart-home-eb" },
};
