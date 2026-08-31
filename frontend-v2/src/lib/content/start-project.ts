import type {
  BudgetRange,
  EngagementModel,
  PreferredContactMethod,
  PreferredContactTime,
  ProductType,
  ProjectStage,
  SolutionModel,
  Timeline,
} from "@/lib/start-project/types";

/**
 * W3.2A — Start Project conversion experience. All marketing/option copy
 * lives here, separate from the interactive components in
 * components/start-project/ and the pure logic in lib/start-project/.
 */

export const START_PROJECT_HERO = {
  eyebrow: "START A PROJECT",
  heading: "Tell us what should work better.",
  supporting:
    "Whether you have a new idea, a recurring business problem, an existing product that needs improvement, or a system that has become difficult to change, start with what you know today. We'll help shape the next step.",
  reassurance: "No complete specification required. Start with the problem.",
  primaryCta: "Tell Us About the Project",
};

export const START_PROJECT_PHILOSOPHY = "Start with the problem. We'll help shape the solution.";

export interface NextStep {
  index: string;
  title: string;
  description: string;
}

export const WHAT_HAPPENS_NEXT_HEADING = "What happens next?";

export const WHAT_HAPPENS_NEXT: NextStep[] = [
  { index: "1", title: "You tell us the problem", description: "Share what you are trying to build, improve or solve." },
  {
    index: "2",
    title: "We review the context",
    description: "We look at the product, business and engineering needs behind it.",
  },
  {
    index: "3",
    title: "We contact you",
    description: "We use your preferred contact method to continue the conversation.",
  },
  {
    index: "4",
    title: "We shape the next step",
    description: "If there is a fit, we help determine discovery, design, engineering or another suitable direction.",
  },
];

export const RESPONSE_TIME_NOTE =
  "Your enquiry will be acknowledged immediately once the production workflow is connected, and AROORAA will review the context to determine the right next step.";

// ---------------------------------------------------------------------------
// Step 1 — Direction
// ---------------------------------------------------------------------------

export const WIZARD_STEP_LABELS = ["Direction", "Context", "Contact"];

export const STEP1_HEADING = "Choose the direction";

export const SOLUTION_MODEL_HEADING = "What kind of solution are you looking for?";
export const SOLUTION_MODEL_SUPPORTING =
  "Choose the closest option. If you are not sure, that is completely fine — we can help identify the right direction.";

export interface SolutionModelOption {
  value: SolutionModel;
  label: string;
  description: string;
}

export const SOLUTION_MODEL_OPTIONS: SolutionModelOption[] = [
  {
    value: "NEW_PRODUCT",
    label: "Build a New Product",
    description: "I have an idea or business opportunity and want to turn it into a real digital product.",
  },
  {
    value: "EXISTING_PRODUCT",
    label: "Improve an Existing Product",
    description:
      "I already have a product or application and need to improve its experience, capabilities, performance or engineering foundation.",
  },
  {
    value: "AI_DATA_AUTOMATION",
    label: "AI, Data or Automation",
    description:
      "I want to reduce manual work, use existing information better, introduce intelligent assistance or explore an AI/data opportunity.",
  },
  {
    value: "APPLICATION_MODERNIZATION",
    label: "Modernize an Existing System",
    description: "I have an older or difficult-to-maintain application that needs modernization without unnecessarily rebuilding everything.",
  },
  {
    value: "CLOUD_PLATFORM",
    label: "Cloud & Platform Engineering",
    description: "I need help with deployment, infrastructure, reliability, scalability, platform engineering or cloud modernization.",
  },
  {
    value: "CONTINUOUS_ENGINEERING",
    label: "Ongoing Product Engineering",
    description: "I need ongoing engineering support to evolve, maintain, stabilize or continuously improve a product.",
  },
  {
    value: "CONNECTED_PRODUCT",
    label: "Connected Product / IoT",
    description: "I am exploring a product that combines software with devices, sensors, edge computing or another physical experience.",
  },
  {
    value: "NEEDS_GUIDANCE",
    label: "I Have a Problem — Help Me Find the Direction",
    description: "I know what is not working, but I am not yet sure what kind of product or engineering solution is needed.",
  },
];

export const ENGAGEMENT_MODEL_HEADING = "How would you like AROORAA to help?";

export interface EngagementModelOption {
  value: EngagementModel;
  label: string;
  description: string;
}

export const ENGAGEMENT_MODEL_OPTIONS: EngagementModelOption[] = [
  {
    value: "DISCOVER_DEFINE",
    label: "Discover & Define",
    description: "Help me understand the problem, shape the product direction and determine what should be built.",
  },
  {
    value: "DESIGN_BUILD",
    label: "Design & Build",
    description: "I want AROORAA to help take the product from concept through design and engineering.",
  },
  {
    value: "IMPROVE_MODERNIZE",
    label: "Improve & Modernize",
    description: "I already have software and need help improving, stabilizing or modernizing it.",
  },
  {
    value: "ADD_AI_AUTOMATION",
    label: "Add AI / Automation",
    description: "I have an existing workflow or product and want to understand where AI or automation could create useful value.",
  },
  {
    value: "ENGINEERING_COLLABORATION",
    label: "Extend My Engineering Team",
    description: "I already have an internal team and need additional specialist product-engineering collaboration for a defined initiative.",
  },
  {
    value: "CONTINUOUS_PRODUCT_PARTNER",
    label: "Continuous Product Partner",
    description: "I need an engineering partner who can help evolve the product beyond a one-time delivery.",
  },
  {
    value: "NEEDS_RECOMMENDATION",
    label: "Recommend the Right Model",
    description: "I am not sure how we should work together yet.",
  },
];

// ---------------------------------------------------------------------------
// Step 2 — Situation
// ---------------------------------------------------------------------------

export const STEP2_HEADING = "Tell us about the situation";

export const PROBLEM_HEADING = "What are you trying to build, improve or solve?";
export const PROBLEM_PLACEHOLDER =
  "Tell us what is happening today, what is difficult, and what you would like to improve. You do not need to describe the technical solution.";
export const PROBLEM_HELPER = "Start with the problem in your own words.";

export const PROBLEM_PROMPTS: string[] = [
  "Who experiences the problem?",
  "What happens today?",
  "What takes too much time?",
  "What is repeated manually?",
  "What should work better?",
  "Is there already a product/system?",
  "What outcome would make the project successful?",
];

export const PROJECT_STAGE_HEADING = "Where are you today?";

export interface ProjectStageOption {
  value: ProjectStage;
  label: string;
}

export const PROJECT_STAGE_OPTIONS: ProjectStageOption[] = [
  { value: "IDEA", label: "Idea" },
  { value: "EXPLORING", label: "Exploring" },
  { value: "REQUIREMENTS_TAKING_SHAPE", label: "Requirements taking shape" },
  { value: "PROTOTYPE_MVP", label: "Prototype / MVP" },
  { value: "EXISTING_PRODUCT", label: "Existing product" },
  { value: "PRODUCTION_SYSTEM", label: "Production system" },
  { value: "NOT_SURE", label: "Not sure" },
];

export const PRODUCT_TYPE_HEADING = "What are we likely working with?";
export const PRODUCT_TYPE_SUPPORTING = "Optional — choose as many as apply.";

export interface ProductTypeOption {
  value: ProductType;
  label: string;
}

export const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  { value: "WEB_APPLICATION", label: "Web application" },
  { value: "MOBILE_APPLICATION", label: "Mobile application" },
  { value: "SAAS_PLATFORM", label: "SaaS / platform" },
  { value: "BACKEND_APIS", label: "Backend / APIs" },
  { value: "AI_DATA", label: "AI / Data" },
  { value: "CLOUD_INFRASTRUCTURE", label: "Cloud / Infrastructure" },
  { value: "CONNECTED_IOT", label: "Connected / IoT product" },
  { value: "EXISTING_ENTERPRISE_APPLICATION", label: "Existing enterprise application" },
  { value: "NOT_SURE", label: "Not sure" },
];

export const TIMELINE_HEADING = "When would you like to move forward?";

export interface TimelineOption {
  value: Timeline;
  label: string;
}

export const TIMELINE_OPTIONS: TimelineOption[] = [
  { value: "ASAP", label: "As soon as practical" },
  { value: "WITHIN_1_TO_3_MONTHS", label: "Within 1–3 months" },
  { value: "WITHIN_3_TO_6_MONTHS", label: "Within 3–6 months" },
  { value: "SIX_MONTHS_PLUS", label: "6+ months" },
  { value: "STILL_EXPLORING", label: "I am still exploring" },
];

export const BUDGET_HEADING = "Have you thought about investment/budget?";
export const BUDGET_SUPPORTING = "Optional — this only helps us understand scale, not to qualify you in or out.";

export interface BudgetRangeOption {
  value: BudgetRange;
  label: string;
}

export const BUDGET_RANGE_OPTIONS: BudgetRangeOption[] = [
  { value: "STILL_DEFINING", label: "I am still defining it" },
  { value: "UNDER_5L", label: "Under ₹5 lakh / equivalent" },
  { value: "FROM_5L_TO_15L", label: "₹5–15 lakh / equivalent" },
  { value: "FROM_15L_TO_50L", label: "₹15–50 lakh / equivalent" },
  { value: "ABOVE_50L", label: "₹50 lakh+ / equivalent" },
  { value: "PREFER_TO_DISCUSS", label: "Prefer to discuss" },
  { value: "NOT_SURE_YET", label: "Not sure yet" },
];

export const EXISTING_SYSTEM_HEADING = "Is there an existing product or system we should understand?";
export const EXISTING_SYSTEM_SUPPORTING = "Optional. For example: current application, current workflow, current platform, known limitations.";

// ---------------------------------------------------------------------------
// Step 3 — Contact
// ---------------------------------------------------------------------------

export const STEP3_HEADING = "How can we reach you?";

export const CONTACT_METHOD_HEADING = "How would you prefer us to contact you?";

export interface ContactMethodOption {
  value: PreferredContactMethod;
  label: string;
}

export const CONTACT_METHOD_OPTIONS: ContactMethodOption[] = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export const WHATSAPP_CONSENT_TEXT =
  "I agree that AROORAA may contact me about this enquiry using WhatsApp at the number provided.";

export const CONTACT_TIME_HEADING = "Best time to contact you";

export interface ContactTimeOption {
  value: PreferredContactTime;
  label: string;
}

export const CONTACT_TIME_OPTIONS: ContactTimeOption[] = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "ANYTIME", label: "Anytime" },
];

export const ROLE_EXAMPLES = ["Founder", "Product", "Engineering", "Operations", "Business", "Other"];

export const TRUST_PRIVACY_NOTE = "What you share is used to understand and respond to your project enquiry.";
export const TRUST_SENSITIVE_DATA_NOTE =
  "Please do not include passwords, API keys, credentials or highly sensitive production data.";

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export const REVIEW_HEADING = "Your project enquiry";
export const REVIEW_SUPPORTING = "Take a moment to check this before we send it.";

// ---------------------------------------------------------------------------
// Draft / session (W3.2A.1 §16)
// ---------------------------------------------------------------------------

export const DRAFT_RESTORED_MESSAGE = "Your unfinished project enquiry has been restored.";
export const START_OVER_LABEL = "Start a New Enquiry";

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

export const SUBMIT_LABEL = "Submit Project";
export const SUBMITTING_LABEL = "Sending your enquiry…";

export const SUCCESS_HEADING = "We've received your project enquiry.";
export const SUCCESS_SUPPORTING =
  "AROORAA now has the context you shared. Once the production lead workflow is connected, this request will be reviewed and the conversation can continue using your preferred contact method.";

export const SUCCESS_NEXT_STEPS = ["Enquiry received", "Context reviewed", "AROORAA reaches out", "Discovery / next step"];

export const ERROR_HEADING = "We couldn't send the enquiry yet.";
export const ERROR_SUPPORTING = "Your information is still here — please try again.";
export const TRY_AGAIN_LABEL = "Try Again";

// ---------------------------------------------------------------------------
// Marketing proof
// ---------------------------------------------------------------------------

export const START_WITH_HEADING = "You can start with…";

export interface StartWithItem {
  title: string;
  description: string;
}

export const START_WITH_ITEMS: StartWithItem[] = [
  { title: "An Idea", description: "You know what you want to explore but not everything required to build it." },
  { title: "A Business Problem", description: "Something repeatedly takes too much time, effort or manual coordination." },
  { title: "An Existing Product", description: "The product works, but needs to evolve." },
  { title: "A Difficult System", description: "The technology has become expensive, fragile or difficult to change." },
];

export const START_WITH_CLOSING = "Not sure which AROORAA service fits? That is fine. Start with the problem.";

export const OWN_PRODUCT_PROOF_LINE =
  "We make product decisions on our own products too — from software platforms to connected physical experiences.";
export const OWN_PRODUCT_PROOF_PRODUCTS = ["MESA", "Mindra", "Smart Mirror", "Arooraa Smart Home"];
export const OWN_PRODUCT_PROOF_CTA = { label: "Explore Our Work", href: "/our-work" };

// ---------------------------------------------------------------------------
// Context-aware copy (W3.2A §29) — restrained, keyed by sourceContext
// ---------------------------------------------------------------------------

export const CONTEXT_AWARE_COPY: Record<string, string> = {
  SMART_MIRROR: "Exploring something around connected experiences or ambient computing? Tell us what you have in mind.",
  SMART_HOME: "Exploring something around connected experiences or ambient computing? Tell us what you have in mind.",
  AI_DATA_AUTOMATION: "Tell us where manual effort, information or decisions are slowing the work down.",
  MESA: "Exploring restaurant or hospitality operations technology? Tell us what you have in mind.",
  MINDRA: "Exploring a personal or family productivity idea? Tell us what you have in mind.",
  APPLICATION_MODERNIZATION: "Tell us about the system that has become difficult or expensive to change.",
  CLOUD_PLATFORM: "Tell us about the deployment, reliability or platform problem you're facing.",
  CONTINUOUS_ENGINEERING: "Tell us what your product needs to keep evolving reliably.",
  PRODUCT_DISCOVERY: "Not sure yet what should be built? Tell us the problem and we'll help shape it.",
  PRODUCT_ENGINEERING: "Ready to move from direction into design and engineering? Tell us what you have in mind.",
};
