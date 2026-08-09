/**
 * Six customer-facing service categories shown on the homepage and on /services.
 * `id` matches a value of the backend's ServiceType enum (see
 * backend/src/main/java/com/arooraa/leads/project/domain/ServiceType.java) so a card can
 * link straight into /start-project with that service pre-selected. The backend enum also
 * has SAAS_PRODUCT, MOBILE_APPLICATION and NOT_SURE — those remain selectable on the
 * Start a Project form without needing their own marketing card here.
 */
export interface ServiceContent {
  id: string;
  title: string;
  outcome: string;
  problem: string;
  whatWeDo: string;
  solutionTypes: string[];
  engagementStyle: string;
}

export const SERVICES: ServiceContent[] = [
  {
    id: "IDEA_PRODUCT_CONSULTING",
    title: "Idea & Product Consulting",
    outcome: "Turn a rough idea or business problem into a validated, buildable product plan.",
    problem:
      "You have a business idea or problem but aren't sure what to build first, or whether it's worth building at all.",
    whatWeDo:
      "We run structured discovery — problem framing, user and market context, scope definition — and hand you a clear product definition you can act on.",
    solutionTypes: ["Product discovery workshops", "Feasibility & scoping", "MVP definition"],
    engagementStyle: "A short, focused engagement before any code is written.",
  },
  {
    id: "WEBSITE_DIGITAL_PLATFORM",
    title: "Websites & Digital Platforms",
    outcome: "A fast, maintainable website or web platform built to represent and grow your business.",
    problem:
      "Your current site doesn't reflect your business, is slow to change, or can't support what you're trying to do online.",
    whatWeDo:
      "We design and build modern, performant web platforms — from marketing sites to content-driven or transactional web apps.",
    solutionTypes: ["Marketing & company websites", "Web platforms & portals", "Headless CMS-driven sites"],
    engagementStyle: "Fixed-scope builds, or ongoing platform ownership.",
  },
  {
    id: "CUSTOM_SOFTWARE",
    title: "Custom Software Development",
    outcome: "Purpose-built software for the way your business actually operates.",
    problem:
      "Off-the-shelf tools don't fit your workflow, or your team is stitching together spreadsheets and disconnected apps.",
    whatWeDo:
      "We design and build custom applications end to end — architecture, backend, frontend, and the operational tooling around them.",
    solutionTypes: ["Internal tools & operational software", "Customer-facing applications", "SaaS products"],
    engagementStyle: "Full-cycle product engineering, from architecture through to deployment.",
  },
  {
    id: "AI_AUTOMATION",
    title: "AI & Automation",
    outcome: "Practical AI and automation that removes manual work and supports real decisions.",
    problem:
      "Repetitive manual work is slowing your team down, or you want to use AI but aren't sure where it would actually help.",
    whatWeDo:
      "We identify where AI or automation genuinely fits — not everywhere — and build it into your existing workflows.",
    solutionTypes: ["Workflow & operations automation", "AI-assisted analytics", "Custom AI assistants & agents"],
    engagementStyle: "Scoped around the specific workflow or decision it supports.",
  },
  {
    id: "APPLICATION_MODERNIZATION",
    title: "Application Modernization",
    outcome: "Bring an aging system onto a stable, maintainable, extensible foundation.",
    problem:
      "Your existing software is risky to change, slow, or built on technology that's becoming a liability.",
    whatWeDo:
      "We assess the existing system, plan a safe migration path, and modernize architecture and code without breaking what already works.",
    solutionTypes: ["Legacy system assessment", "Incremental re-architecture", "Platform & framework upgrades"],
    engagementStyle: "Phased, with working software preserved at every stage.",
  },
  {
    id: "CLOUD_DEVOPS",
    title: "Cloud & Continuous Support",
    outcome: "Reliable infrastructure, and ongoing engineering support after launch.",
    problem: "You need your software to run reliably in production, and to keep evolving after the initial build.",
    whatWeDo:
      "We set up cloud infrastructure, deployment pipelines and monitoring, then provide continuous support as your product grows.",
    solutionTypes: ["Cloud architecture & DevOps", "CI/CD & deployment pipelines", "Ongoing maintenance & support"],
    engagementStyle: "Project-based setup, or an ongoing support relationship.",
  },
];
