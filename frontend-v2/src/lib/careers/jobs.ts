import type { JobOpening } from "./types";

/**
 * The six approved career paths (W3.3A §7). All marked OPEN — confirmed as
 * genuine current AROORAA openings for this milestone. Every other
 * page/component derives from this array; nothing about a job is hardcoded
 * anywhere else. `JobStatus` still supports PLANNED/CLOSED so a role can
 * move out of active hiring later without a data-model change.
 */
export const JOBS: JobOpening[] = [
  {
    id: "ai-engineer",
    slug: "ai-engineer",
    title: "AI Engineer",
    team: "AI_DATA",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Build the AI capabilities that power AROORAA's products and internal engineering workflows — from retrieval and agents to production-grade model integration.",
    aboutTheRole:
      "AROORAA is building AI into its products where it genuinely helps, not as a feature checkbox. This role exists to take AI from a promising idea to a dependable part of a product: integrated, evaluated and observable in production.",
    responsibilities: [
      "Build LLM-powered features across AROORAA products — retrieval-augmented generation, embeddings and vector search, agent and workflow orchestration",
      "Design prompt architecture and evaluation approaches that hold up outside a demo",
      "Integrate AI capabilities with the Java and Python services already running in production",
      "Use cloud and container fundamentals to deploy and operate AI components reliably",
      "Add production observability so AI behavior is visible, not a black box",
      "Work with product and engineering to decide where AI genuinely improves a product, and where it doesn't",
    ],
    qualifications: [
      "Practical experience building with LLMs — API integration, prompt design, RAG or agent patterns",
      "Comfortable with Python and working with APIs",
      "Understanding of vector databases and embeddings-based retrieval",
      "Backend engineering fundamentals — able to reason about services, not only notebooks",
      "Familiarity with cloud and container basics (Docker, a cloud provider)",
    ],
    preferredQualifications: [
      "Experience evaluating or testing LLM output quality, not only building the happy path",
      "Exposure to AI safety and quality considerations in a production setting",
      "Experience working alongside a Java backend",
    ],
    skills: ["Python", "LLM Integration", "RAG", "Vector Search", "APIs"],
    howWeThinkAboutThisRole:
      "AI is useful when it reduces complexity or creates capabilities a deterministic product alone cannot provide. We are not looking to train foundation models from scratch — we're looking for someone who can turn existing models into dependable product capability.",
    status: "OPEN",
  },
  {
    id: "java-full-stack-engineer",
    slug: "java-full-stack-engineer",
    title: "Java Full Stack Engineer",
    team: "ENGINEERING",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Work across the backend and the web application — build the APIs, services and user-facing features that make an AROORAA product work end to end.",
    aboutTheRole:
      "AROORAA products span backend services and modern web applications, and this role exists to work across that full boundary — someone who can design an API and also care about how it's actually used on screen.",
    responsibilities: [
      "Design and build backend services and REST APIs in Java (17/21+) and Spring Boot",
      "Work with PostgreSQL and Redis for data and caching, including event-driven patterns where they fit",
      "Contribute to the web application layer, with exposure to React and Next.js",
      "Containerize and run services with Docker",
      "Write tests that make changes safe, not just present",
      "Build with secure backend development practices as a default, not an afterthought",
    ],
    qualifications: [
      "Solid experience with Java and Spring Boot in production systems",
      "Comfortable designing and consuming REST APIs",
      "Working knowledge of PostgreSQL and relational data modeling",
      "Some exposure to frontend development (React or similar)",
      "Understanding of secure backend development practices",
    ],
    preferredQualifications: [
      "Experience with Redis or another caching layer",
      "Exposure to event-driven architecture",
      "Experience with Next.js specifically",
    ],
    skills: ["Java", "Spring Boot", "PostgreSQL", "React", "Docker"],
    howWeThinkAboutThisRole:
      "A backend is only as useful as what it lets people actually do. We want engineers who treat the API and the screen it eventually reaches as one connected system, not two separate jobs.",
    status: "OPEN",
  },
  {
    id: "react-frontend-engineer",
    slug: "react-frontend-engineer",
    title: "React Frontend Engineer",
    team: "ENGINEERING",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Turn product and design intent into responsive, accessible, polished interfaces across AROORAA's web applications.",
    aboutTheRole:
      "Good product decisions can still fail at the interface if the experience is confusing, slow or inconsistent. This role exists to make sure that doesn't happen — to turn what a product should do into something people can use with confidence.",
    responsibilities: [
      "Build responsive, accessible product interfaces in React, Next.js and TypeScript",
      "Turn UX intent and design-system thinking into production-quality UI",
      "Integrate frontend applications with backend APIs",
      "Care about performance — loading, interaction and perceived speed",
      "Contribute to and help evolve a shared design system as AROORAA's products grow",
      "Write frontend tests that catch real regressions",
    ],
    qualifications: [
      "Strong hands-on experience with React and TypeScript",
      "Experience with Next.js or a comparable modern web framework",
      "An eye for responsive layout and accessibility, not only visual polish",
      "Experience integrating with REST APIs",
      "Understanding of frontend architecture and component design",
    ],
    preferredQualifications: [
      "Experience contributing to or building a design system",
      "Familiarity with frontend performance tooling",
      "Experience with automated frontend testing",
    ],
    skills: ["React", "Next.js", "TypeScript", "Accessibility", "APIs"],
    howWeThinkAboutThisRole:
      "Polish is not decoration. A product becomes useful when users can understand and operate it confidently — that's the bar for this role, not just visual craft.",
    status: "OPEN",
  },
  {
    id: "ui-ux-product-designer",
    slug: "ui-ux-product-designer",
    title: "UI/UX Product Designer",
    team: "PRODUCT_DESIGN",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Turn ambiguous problems and real workflows into interfaces people understand quickly and enjoy using, from early discovery through high-fidelity design.",
    aboutTheRole:
      "AROORAA builds products around real, often complicated workflows. This role exists to make sure the complexity gets absorbed by good design, not passed on to the person using the product.",
    responsibilities: [
      "Take part in product discovery — understanding user journeys and real workflows before designing screens",
      "Produce wireframes, interaction flows and high-fidelity UI",
      "Build and iterate on prototypes to test ideas before they're built",
      "Contribute to and maintain design-system thinking across AROORAA products",
      "Design for responsive and mobile experiences, not desktop-only",
      "Work closely with engineers through implementation, not just handoff",
    ],
    qualifications: [
      "A portfolio demonstrating product design thinking, not only visual design",
      "Experience with wireframing, prototyping and high-fidelity UI design tools",
      "Understanding of usability principles and how to validate them",
      "Experience designing responsive and mobile interfaces",
      "Comfortable working closely with engineering through build",
    ],
    preferredQualifications: [
      "Experience establishing or extending a design system",
      "Experience designing for SaaS or multi-tenant products",
      "Familiarity with basic frontend constraints — what's easy versus expensive to build",
    ],
    skills: ["Product Discovery", "Interaction Design", "Prototyping", "Design Systems"],
    howWeThinkAboutThisRole:
      "A complicated workflow doesn't have to feel complicated to use. This role exists to find the difference between the two, and design in favor of the person using the product.",
    status: "OPEN",
  },
  {
    id: "sales-business-development",
    slug: "sales-business-development",
    title: "Sales & Business Development Executive",
    team: "SALES",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Understand real business problems, have meaningful conversations, and connect the right AROORAA capability to a customer's actual need.",
    aboutTheRole:
      "AROORAA doesn't sell by pushing a fixed product into every conversation. This role exists to have the earliest conversation with a potential customer — understanding their problem well enough to know whether, and how, AROORAA can genuinely help.",
    responsibilities: [
      "Identify and reach out to prospects whose problems plausibly match what AROORAA builds",
      "Run discovery conversations focused on understanding the business problem, not just pitching",
      "Coordinate deeper technical or product discovery with the team when a conversation is worth continuing",
      "Maintain CRM records and follow up on leads in a timely, organized way",
      "Prepare proposals and help develop the relationship from first contact onward",
      "Run product demos where appropriate, once the fit is understood",
    ],
    qualifications: [
      "Experience in a sales, business development or client-facing role",
      "Comfortable initiating and running structured conversations with prospective customers",
      "Organized, consistent follow-up habits — comfortable working inside a CRM",
      "Ability to understand a business problem well enough to explain it back accurately",
      "Clear written and verbal communication",
    ],
    preferredQualifications: [
      "Experience selling technology, software or engineering services",
      "Experience preparing proposals or commercial documents",
      "Exposure to product demos or technical conversations",
    ],
    skills: ["Discovery", "CRM", "Relationship Building", "Proposals"],
    howWeThinkAboutThisRole:
      "The job is not to force a product onto a customer. It is to understand the problem well enough to determine whether AROORAA can genuinely help — and to say so honestly when it can't.",
    status: "OPEN",
  },
  {
    id: "marketing-growth-executive",
    slug: "marketing-growth-executive",
    title: "Marketing & Growth Executive",
    team: "MARKETING",
    location: "Chennai, Tamil Nadu, India",
    summary:
      "Help the market understand what AROORAA builds — across products and engineering services — and where that creates real value.",
    aboutTheRole:
      "AROORAA builds several products alongside engineering services, and that combination is easy to explain badly. This role exists to communicate it clearly — what AROORAA builds, why it matters, and for whom — without flattening it into generic agency language.",
    responsibilities: [
      "Plan and run digital marketing campaigns across the website and relevant channels",
      "Create content — written, visual or campaign-based — that explains AROORAA's products and engineering work honestly",
      "Support product launches and major releases with marketing planning",
      "Apply SEO fundamentals to improve how AROORAA's site and content are found",
      "Manage social media presence and audience engagement",
      "Conduct market and customer research to inform positioning and messaging",
      "Support lead generation efforts in coordination with sales",
    ],
    qualifications: [
      "Experience in digital marketing, content marketing or product marketing",
      "Comfortable writing clearly for different audiences, technical and non-technical",
      "Working knowledge of SEO fundamentals",
      "Experience managing social media or digital campaigns",
      "Basic comfort with marketing and analytics tooling",
    ],
    preferredQualifications: [
      "Experience marketing a technology product or B2B software",
      "Experience with product-launch marketing specifically",
      "Experience conducting customer or market research",
    ],
    skills: ["Content", "SEO", "Digital Campaigns", "Product Marketing"],
    howWeThinkAboutThisRole:
      "AROORAA is a product-engineering company, not a generic services vendor — marketing here means explaining both the products we build and the engineering work we do, without reducing either to a buzzword.",
    status: "OPEN",
  },
];

export function getAllJobs(): JobOpening[] {
  return JOBS;
}

export function getOpenJobs(): JobOpening[] {
  return JOBS.filter((job) => job.status === "OPEN");
}

export function getJobBySlug(slug: string): JobOpening | undefined {
  return JOBS.find((job) => job.slug === slug);
}

export function getAllSlugs(): string[] {
  return JOBS.map((job) => job.slug);
}

export function getPlannedJobs(): JobOpening[] {
  return JOBS.filter((job) => job.status === "PLANNED");
}

/** Other non-closed roles, for a job-detail page's "related openings" list. */
export function getRelatedJobs(currentSlug: string, limit = 3): JobOpening[] {
  return JOBS.filter((job) => job.slug !== currentSlug && job.status !== "CLOSED").slice(0, limit);
}
