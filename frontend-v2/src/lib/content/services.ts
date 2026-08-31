export interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  href: string;
}

/**
 * The six frozen Phase 0 §4 service groups. Descriptions are the M3B brief's
 * own directions, lightly smoothed for grammar — do not add a seventh group
 * or split any of these further.
 */
export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "product-discovery",
    name: "Product Strategy & Discovery",
    description:
      "Turn ideas and business problems into a clear product direction, MVP scope, architecture and roadmap.",
    href: "/services/product-discovery",
  },
  {
    id: "product-engineering",
    name: "Product Engineering",
    description:
      "Design and engineer SaaS platforms, web and mobile applications, enterprise systems, APIs and custom digital products.",
    href: "/services/product-engineering",
  },
  {
    id: "ai-automation",
    name: "AI, Data & Automation",
    description: "Apply AI, data and automation where they create practical business value.",
    href: "/services/ai-automation",
  },
  {
    id: "application-modernization",
    name: "Application Modernization",
    description:
      "Modernize legacy applications, architecture, APIs, interfaces and technology foundations incrementally.",
    href: "/services/application-modernization",
  },
  {
    id: "cloud-platform",
    name: "Cloud & Platform Engineering",
    description: "Build reliable cloud, deployment, CI/CD, observability and platform foundations.",
    href: "/services/cloud-platform",
  },
  {
    id: "continuous-engineering",
    name: "Continuous Engineering",
    description: "Support, improve and evolve products after launch.",
    href: "/services/continuous-engineering",
  },
];

export function getServiceGroup(id: string): ServiceGroup {
  const found = SERVICE_GROUPS.find((service) => service.id === id);
  if (!found) {
    throw new Error(`Unknown service group id: ${id}`);
  }
  return found;
}

export const SERVICES_HEADING = {
  eyebrow: "Services",
  title: "What We Build for Clients",
};

export interface ProblemStatement {
  id: string;
  number: string;
  problem: string;
  explanation: string;
  /** References SERVICE_GROUPS ids, in display order — a problem may route to more than one group. */
  serviceIds: string[];
}

export const PROBLEMS_HEADING = {
  eyebrow: "How We Help",
  title: "What are you trying to solve?",
};

/**
 * The five approved M3B §2 problem scenarios, phrased the way a customer
 * would actually say them — not agency copywriting.
 */
export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: "idea",
    number: "01",
    problem: "I have an idea but don't know where to start.",
    explanation: "We help turn the idea into a defined product, MVP scope and technical roadmap.",
    serviceIds: ["product-discovery"],
  },
  {
    id: "manual-processes",
    number: "02",
    problem: "Our business still depends on manual processes.",
    explanation:
      "We build the software and automation that take over the repetitive work, so your team can focus on what actually needs a person.",
    serviceIds: ["product-engineering", "ai-automation"],
  },
  {
    id: "hard-to-maintain",
    number: "03",
    problem: "Our existing application is difficult to maintain.",
    explanation:
      "We modernize the codebase, architecture and infrastructure incrementally, without stopping the business to do it.",
    serviceIds: ["application-modernization"],
  },
  {
    id: "ai-value",
    number: "04",
    problem: "We want to use AI but don't know where it creates real value.",
    explanation: "We help identify where AI actually saves time or money for your business, then build it.",
    serviceIds: ["ai-automation"],
  },
  {
    id: "scale",
    number: "05",
    problem: "Our product needs to scale.",
    explanation:
      "We strengthen the architecture, infrastructure and engineering practices so growth doesn't break what you've already built.",
    serviceIds: ["cloud-platform", "product-engineering"],
  },
];

/* ---------------------------------------------------------------------- */
/* Services Index (S1) — additive only. PROBLEM_STATEMENTS/SERVICE_GROUPS  */
/* above stay untouched (the homepage's WhatWeBuild/ProblemsWeSolve read   */
/* them directly); everything below is consumed only by /services.        */
/* ---------------------------------------------------------------------- */

export const SERVICES_INDEX_HERO = {
  eyebrow: "SERVICES",
  title: "From idea to production — and beyond.",
  supporting:
    "AROORAA helps businesses discover, design, engineer, modernize and operate digital products. Start with an idea, a business problem or an existing system that needs to work better.",
  primaryCta: { label: "Start a Project", href: "/start-project" },
  secondaryCta: { label: "See How We Work", href: "#how-we-work" },
};

export interface ServiceScenario {
  id: string;
  number: string;
  problem: string;
  /** References SERVICE_GROUPS ids, in display order — a scenario may route to more than one group. */
  serviceIds: string[];
}

export const SERVICES_INDEX_PROBLEMS_HEADING = {
  eyebrow: "Start With The Problem",
  title: "What are you trying to solve?",
};

/**
 * A richer, Services-Index-specific set of scenarios (7, vs. the homepage's
 * 5 in PROBLEM_STATEMENTS above) — deliberately a separate export so the
 * frozen homepage's ProblemsWeSolve section is untouched. Covers all six
 * service groups at least once, phrased the way a customer would say it.
 */
export const SERVICES_INDEX_PROBLEMS: ServiceScenario[] = [
  {
    id: "idea",
    number: "01",
    problem: "I have an idea but don't know where to start.",
    serviceIds: ["product-discovery"],
  },
  {
    id: "build-mvp",
    number: "02",
    problem: "We need to build a product or MVP.",
    serviceIds: ["product-engineering"],
  },
  {
    id: "manual-work",
    number: "03",
    problem: "Our team is doing too much manual work.",
    serviceIds: ["ai-automation", "product-engineering"],
  },
  {
    id: "hard-to-maintain",
    number: "04",
    problem: "Our application is difficult to maintain.",
    serviceIds: ["application-modernization"],
  },
  {
    id: "ai-value",
    number: "05",
    problem: "We want to use AI but don't know where it creates value.",
    serviceIds: ["ai-automation"],
  },
  {
    id: "scale",
    number: "06",
    problem: "Our platform needs to scale and operate reliably.",
    serviceIds: ["cloud-platform"],
  },
  {
    id: "post-launch",
    number: "07",
    problem: "We already launched, but need engineering support.",
    serviceIds: ["continuous-engineering"],
  },
];

export interface CrossCuttingCapability {
  name: string;
  description: string;
}

export const CROSS_CUTTING_HEADING = {
  eyebrow: "Applied Across Engagements",
  title: "Cross-cutting capabilities, not separate services.",
};

/**
 * Explicitly NOT top-level service groups — applied across engagements
 * regardless of which SERVICE_GROUPS entry a client starts from (brief §9).
 */
export const CROSS_CUTTING_CAPABILITIES: CrossCuttingCapability[] = [
  { name: "UX / UI", description: "Flows, interaction design, design systems and usable product experiences." },
  {
    name: "Quality Engineering",
    description: "Unit, integration, API, UI/E2E, performance and quality-gate practices.",
  },
  {
    name: "Security by Design",
    description:
      "Authentication, authorization, tenant isolation, secrets, validation, auditability and least-privilege thinking.",
  },
];

export interface EngagementModel {
  name: string;
  description: string;
}

export const ENGAGEMENT_MODELS_HEADING = {
  eyebrow: "Engagement Models",
  title: "How engagements typically start.",
};

export const ENGAGEMENT_MODELS: EngagementModel[] = [
  { name: "Discovery Sprint", description: "For ideas or problems needing clarity, scope and roadmap." },
  { name: "Build Engagement", description: "For MVPs, new products or substantial feature/platform delivery." },
  { name: "Modernization Engagement", description: "For existing systems requiring staged improvement." },
  {
    name: "Continuous Engineering",
    description: "For ongoing maintenance, support, reliability and product evolution.",
  },
];

export const SERVICES_ENGINEERING_PROOF_HEADING = {
  eyebrow: "Product Engineering Proof",
  title: "We build products ourselves.",
  description: "We bring product thinking from our own builds into client engagements.",
};

/** Compact "How We Work" heading for the Services Index — the shared journey
 * data (DELIVERY_STAGES in process.ts) is reused as-is; this is only a
 * shorter, Services-specific heading so the page doesn't repeat the
 * homepage's own How We Work heading text verbatim. */
export const SERVICES_HOW_WE_WORK_HEADING = {
  eyebrow: "How We Work",
  title: "Engagements can start at any stage.",
  description:
    "The goal is not to force every client through the same package — it is to solve the current problem and build a reliable path forward.",
};

export const SERVICES_INDEX_CTA = {
  title: "Have an idea, a problem or a system that needs to work better?",
  supporting: "Start with what you're trying to solve. We'll help shape the right engagement.",
  primary: { label: "Start a Project", href: "/start-project" },
  secondary: { label: "Contact AROORAA", href: "/contact" },
};
