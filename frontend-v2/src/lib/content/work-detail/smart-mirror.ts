/**
 * Content for /our-work/smart-mirror (W2.3) — the third Our Work engineering
 * story. Deliberately its own file, separate from lib/content/products.ts
 * (the approved public Smart Mirror product page) and lib/content/our-work.ts
 * (the index page's summary content) — this page tells neither of those
 * stories again. It explains why AROORAA explored ambient computing through
 * an ordinary object and what building the prototype demonstrates — not a
 * feature list.
 *
 * Public-truth boundary (per the W2.3 brief): Smart Mirror is an
 * AROORAA PRODUCT · COMING SOON / CONCEPT + PROTOTYPE DIRECTION — nothing on
 * this page implies commercial availability, deployed customer
 * installations, production-ready fitness analysis, deployed salon systems,
 * deployed restaurant installations, real users or real customer data. The
 * home/gym/salon/hospitality visuals are experience concepts illustrating
 * future product possibilities, each explicitly labeled as such. The only
 * current, factual claim is the prototype itself: a physical Smart Mirror
 * concept using a reflective surface + display approach with a Raspberry Pi
 * 5 prototype edge-computing foundation.
 */

export const SMART_MIRROR_STORY_HERO = {
  eyebrow: "AROORAA PRODUCT STORY · SMART MIRROR",
  title: "What if technology could be useful without demanding another screen?",
  supporting:
    "Smart Mirror began as an exploration of ambient computing — bringing useful digital context into an object already present in everyday life, while keeping the mirror, the person and the surrounding environment at the center of the experience.",
  maturityLabel: "AROORAA PRODUCT · COMING SOON / CONCEPT + PROTOTYPE DIRECTION",
  primaryCta: { label: "Explore Smart Mirror", href: "/products/smart-mirror" },
  secondaryCta: { label: "Start a Project", href: "/start-project" },
};

export interface SmartMirrorChapterHeading {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  supporting?: string;
}

/* ACT I — WHY */

export const CHAPTER_INTERACTION_CONTRAST: SmartMirrorChapterHeading = {
  id: "interaction-contrast",
  index: "01",
  eyebrow: "The Original Question",
  title: "The problem was not a missing screen.",
  supporting: "We already have phones, laptops, televisions and tablets. The question was not how to add another interface to daily life.",
};

export const INTERACTION_QUESTION = "Can useful information appear inside a routine that already exists — and disappear when it is no longer needed?";

export const INTERACTION_POINTS = [
  "Active screens demand attention.",
  "Some information only requires a glance.",
  "Morning preparation is a natural moment.",
  "Ambient technology should reduce interaction cost rather than increase it.",
];

export const ACTIVE_SCREEN_STEPS = ["Reach", "Unlock", "Open", "Navigate", "Consume"];
export const AMBIENT_GLANCE_STEPS = ["Look", "Understand", "Continue"];

export const CHAPTER_MIRROR_FIRST: SmartMirrorChapterHeading = {
  id: "mirror-first",
  index: "02",
  eyebrow: "A Non-Negotiable Constraint",
  title: "A Smart Mirror still has to work as a mirror first.",
  supporting: "Reflection remains primary. Digital information remains secondary — information density must be controlled, and the experience must know when to disappear.",
};

export const MIRROR_FIRST_KEY_LINE = "If the technology gets in the way of the reflection, the product has failed.";

export interface MirrorState {
  name: string;
  description: string;
}

export const MIRROR_STATES: MirrorState[] = [
  { name: "Quiet", description: "Almost entirely a mirror." },
  { name: "Glance", description: "One or two useful pieces of context." },
  { name: "Active Moment", description: "Slightly richer content when appropriate." },
];

/* ACT II — ONE MIRROR, DIFFERENT CONTEXTS */

export const EXPERIENCE_DIRECTIONS_LABEL = "Experience Directions";

export const CHAPTER_HOME: SmartMirrorChapterHeading = {
  id: "home",
  index: "03",
  eyebrow: "Where The Idea Started",
  title: "The morning routine gave the idea somewhere real to live.",
  supporting: "The mirror should help someone begin the day, not become the first application they have to manage.",
};

export interface MorningMoment {
  name: string;
  description: string;
}

/** W2.3A — the routine-unfolding sequence for Chapter 03's native visual. */
export const MORNING_MOMENTS: MorningMoment[] = [
  { name: "Start", description: "The person begins the morning." },
  { name: "Prepare", description: "One or two useful pieces of context appear while getting ready." },
  { name: "Leave", description: "Only the next important item remains." },
];

export const HOME_CONCEPT_LABEL = "Home experience concept";
export const HOME_CONCEPT_ITEMS = [
  "Time & day context",
  "Reminders",
  "Calendar",
  "Family & home context",
  "Simple wellness context",
  "Information relevant before leaving",
];

export const CHAPTER_GYM: SmartMirrorChapterHeading = {
  id: "gym",
  index: "04",
  eyebrow: "A Different Environment, A Different Companion",
  title: "The same ambient surface can become a different kind of companion in a fitness environment.",
};

export const GYM_CONCEPT_LABEL = "Fitness experience concept";
export const GYM_CONCEPT_ITEMS = ["Weight", "BMI", "Workout progress", "Active minutes", "Training goals", "Posture or wellness guidance"];
export const GYM_FUTURE_DIRECTION =
  "A future fitness experience could surface approved measurements or connected wellness data in a glanceable format. The figures shown are illustrative mock data, not a medical assessment, a diagnosis or a clinically validated body-composition measurement.";

export const CHAPTER_SALON: SmartMirrorChapterHeading = {
  id: "salon",
  index: "05",
  eyebrow: "Part Of The Decision, Not After It",
  title: "In a salon, the mirror can become part of the decision before the service begins.",
};

export const SALON_CONCEPT_LABEL = "Salon experience concept";
export const SALON_CONCEPT_ITEMS = [
  "Preview multiple haircut directions",
  "Compare styles side by side",
  "Discuss the preferred option with the stylist",
  "Select a look before service begins",
  "Explore grooming and facial-care directions",
];
export const SALON_FUTURE_DIRECTION =
  "A future salon experience could help customers preview and compare style directions before discussing the final choice with the stylist. It would not guarantee style suitability, perform biometric face analysis or provide medical or dermatologist-grade skin diagnosis — the person and the stylist remain in control of the decision.";

export const CHAPTER_HOSPITALITY: SmartMirrorChapterHeading = {
  id: "hospitality",
  index: "06",
  eyebrow: "Part Of The Experience, Not Another Kiosk",
  title: "In hospitality, the mirror can become part of the experience rather than another kiosk.",
};

export const HOSPITALITY_CONCEPT_LABEL = "Hospitality experience concept";
export const HOSPITALITY_CONCEPT_ITEMS = [
  "Personalized welcome",
  "Table and reservation context",
  "Menu and specials",
  "Experience guidance",
  "Event and ambience information",
  "Simple service actions",
];
export const HOSPITALITY_FUTURE_DIRECTION =
  "A future hospitality experience could surface relevant guest-facing context in a premium ambient interface. It would not imply guest facial recognition, a live integration with any restaurant's booking system, or a deployed connection to MESA or any other AROORAA product unless explicitly built and verified.";

export const CHAPTER_ENVIRONMENTS: SmartMirrorChapterHeading = {
  id: "environments",
  index: "07",
  eyebrow: "The Important Lesson",
  title: "The mirror is the same object. The experience changes with the environment.",
  supporting: "Context should shape the experience. The product should not force the same dashboard into every room.",
};

export const ENVIRONMENTS = ["Home", "Fitness", "Salon", "Hospitality"];

/** W2.3A — one subtle, real-text context cue per environment strip. */
export const ENVIRONMENT_CUES: Record<string, string> = {
  Home: "Morning routine",
  Fitness: "Workout companion",
  Salon: "Style preview",
  Hospitality: "Guest welcome",
};

/* ACT III — DESIGNING AMBIENT COMPUTING */

export const CHAPTER_ATTENTION: SmartMirrorChapterHeading = {
  id: "attention",
  index: "08",
  eyebrow: "Designing For Relevance",
  title: "Not everything deserves to appear just because the system knows it.",
  supporting: "Relevance should control visibility, not the amount of available data.",
};

export interface AttentionTier {
  name: string;
  description: string;
}

export const ATTENTION_TIERS: AttentionTier[] = [
  { name: "Now", description: "Useful in this exact moment." },
  { name: "Soon", description: "Approaching context that may deserve attention." },
  { name: "Available", description: "Accessible if the user asks for it." },
];

export const CHAPTER_DAY_RHYTHM: SmartMirrorChapterHeading = {
  id: "day-rhythm",
  index: "09",
  eyebrow: "Moving Through The Day",
  title: "The same mirror can move through the day without becoming a different product.",
};

export interface DayRhythmMoment {
  name: string;
  description: string;
}

export const DAY_RHYTHM_MOMENTS: DayRhythmMoment[] = [
  { name: "Morning", description: "Useful context appears." },
  { name: "Leaving", description: "Only the next important item remains." },
  { name: "Evening", description: "A calmer family and home context." },
  { name: "Quiet", description: "The interface disappears and the mirror returns to being almost completely reflective." },
];

/* ACT IV — FROM INTERFACE TO PHYSICAL PRODUCT */

export const CHAPTER_PHYSICAL_PRODUCT: SmartMirrorChapterHeading = {
  id: "physical-product",
  index: "10",
  eyebrow: "Where Software Becomes Physical",
  title: "Software decisions became physical the moment the interface moved behind a reflective surface.",
  supporting: "Every physical layer changes the experience of the layer in front of it.",
};

export const PHYSICAL_LAYERS = ["Reflective acrylic / two-way surface", "Digital display", "Raspberry Pi 5 prototype edge platform", "Slim frame", "Rear mounting system"];

export const PHYSICAL_CONCERNS = ["Visibility", "Viewing distance", "Depth", "Brightness", "Heat", "Power", "Maintainability", "Mounting", "Aesthetics"];

export const CHAPTER_EDGE_FOUNDATION: SmartMirrorChapterHeading = {
  id: "edge-foundation",
  index: "11",
  eyebrow: "Somewhere For The Experience To Live",
  title: "The experience needed somewhere to live inside the product.",
  supporting: "The prototype uses Raspberry Pi 5 as an edge-computing foundation for experimentation.",
};

export const EDGE_STAGES = ["Mirror Experience", "Local Product Runtime", "Physical Environment"];
export const EDGE_EXTERNAL_CONTEXT = "External / cloud context (optional, supporting)";
export const EDGE_FRAMING =
  "A prototype platform for local runtime experimentation and physical-product foundation work — not a final production hardware commitment, a Raspberry Pi partnership, or a certification claim.";

/* ACT V — TRUST */

export const CHAPTER_PRIVACY: SmartMirrorChapterHeading = {
  id: "privacy",
  index: "12",
  eyebrow: "Earning The Right To Be Smarter",
  title: "A device inside a private space should earn the right to become smarter.",
  supporting: "Capability does not automatically justify sensing.",
};

export const PRIVACY_PRINCIPLES = [
  "Home is a private environment.",
  "Capability does not automatically justify sensing.",
  "Camera and microphone concepts are never assumed always-on.",
  "Local processing is used where it is appropriate.",
  "Explicit user control matters.",
  "Minimal data collection is often the better product decision.",
];

/* ACT VI — ENGINEERING PROOF */

export const CHAPTER_ENGINEERING_PROOF: SmartMirrorChapterHeading = {
  id: "engineering-proof",
  index: "13",
  eyebrow: "Where Software Met The Object",
  title: "The interesting engineering began where software met the object.",
};

export interface EngineeringLayer {
  name: string;
  description: string;
}

export const ENGINEERING_LAYERS: EngineeringLayer[] = [
  { name: "Experience", description: "What the person sees." },
  { name: "Display", description: "How content appears through the reflective surface." },
  { name: "Edge", description: "Where the local experience runs." },
  { name: "Physical Product", description: "Frame, enclosure, mounting and environment." },
];

export const ENGINEERING_CONSIDERATIONS = [
  "Startup and recovery",
  "Display behavior",
  "Local state",
  "Maintainability",
  "Environment",
  "Experience consistency",
  "Physical constraints",
];

/* ACT VII — CURRENT PROTOTYPE VS FUTURE */

export const CHAPTER_PROTOTYPE_VS_FUTURE: SmartMirrorChapterHeading = {
  id: "prototype-vs-future",
  index: "14",
  eyebrow: "Honest About What Exists Today",
  title: "The prototype proves the direction. It does not pretend the product is finished.",
};

export const PROTOTYPE_NOW_LABEL = "Prototype Foundation / Current Exploration";
export const PROTOTYPE_NOW_ITEMS = [
  "Physical Smart Mirror concept",
  "Reflective surface + display approach",
  "Raspberry Pi 5 prototype foundation",
  "Ambient UI experimentation",
  "Morning / contextual experience exploration",
];

export const PROTOTYPE_FUTURE_LABEL = "Future Application Directions";
export const PROTOTYPE_FUTURE_ITEMS = [
  "Richer contextual assistance",
  "Home / family context",
  "Natural interaction",
  "Fitness experiences",
  "Salon / styling experiences",
  "Hospitality experiences",
  "Deeper local intelligence",
  "Appropriate smart-home integrations",
  "More adaptive ambient experiences",
];

/* CLOSING */

export const SMART_MIRROR_STORY_CLOSING = {
  title: "Smart Mirror started with a mirror. The bigger question is how technology should exist around us.",
  supporting: "We are exploring how software, edge computing and physical-product design can create experiences that are useful without constantly competing for attention.",
};

export const CLOSING_PRINCIPLE = "The future of computing does not always need to look like a computer.";

export const SMART_MIRROR_STORY_RELATED_LINKS = [
  { label: "Explore Smart Mirror", href: "/products/smart-mirror" },
  { label: "AI, Data & Automation", href: "/services/ai-automation" },
  { label: "Product Engineering", href: "/services/product-engineering" },
  { label: "Start a Project", href: "/start-project" },
];

export const SMART_MIRROR_STORY_FINAL_CTA = {
  title: "Curious what ambient computing could look like for your product?",
  supporting: "Start with the environment and the routine, not the screen. We can help explore where technology should disappear and where it should still show up.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Explore Smart Mirror", href: "/products/smart-mirror" },
};
