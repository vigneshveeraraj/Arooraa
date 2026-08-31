import type { ServicePageContent } from "./service-page";

/**
 * Individual service detail page content (S2+). Bundled in one file the
 * same way products.ts bundles every product page's content — each future
 * service (Product Engineering, AI/Data/Automation, etc.) gets its own
 * export here as it's built.
 */

/**
 * S2 — Product Strategy & Discovery. Positions discovery as reducing
 * product risk before expensive engineering begins, not as generic
 * consulting or workshop facilitation. No pricing (brief §14 — left out
 * pending a separate commercial decision), no fabricated project/workshop
 * counts, no promised timelines — only AROORAA's own products as proof.
 */
export const PRODUCT_DISCOVERY_SERVICE_PAGE: ServicePageContent = {
  id: "product-discovery",
  name: "Product Strategy & Discovery",
  hero: {
    eyebrow: "PRODUCT STRATEGY & DISCOVERY",
    title: "Turn an idea into a product direction worth building.",
    supporting:
      "We help turn business problems, product ideas and unclear opportunities into a defined MVP, clearer priorities and an engineering roadmap grounded in real constraints.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "See the Discovery Approach", href: "#approach" },
  },
  businessProblem: {
    title: "Good engineering cannot rescue an unclear product direction.",
    body: "An idea exists, but the scope is still vague. Different stakeholders want different things. The current workflow isn't fully understood. Feature lists grow without clear priorities. Technical complexity gets discovered too late. Teams want to start development before validating assumptions. There's no realistic MVP boundary yet. None of this means a project is in trouble — it means discovery hasn't happened.",
    layout: "featured",
  },
  audience: {
    title: "Who it's for.",
    items: [
      { name: "Founders / Product Owners", description: "You have an idea and need to turn it into a clear first product." },
      {
        name: "Businesses with Manual Workflows",
        description: "You know a process should be improved but don't yet know what the right product should look like.",
      },
      {
        name: "Existing Product Teams",
        description: "You need clarity around a new module, major feature or next product direction.",
      },
      {
        name: "Modernization Initiatives",
        description: "You need to understand what should be preserved, changed or rebuilt before engineering starts.",
      },
    ],
  },
  problems: {
    title: "Where discovery creates clarity",
    items: [
      "Unclear Problem Definition",
      "Conflicting Stakeholder Expectations",
      "Oversized MVP Scope",
      "Feature-First Thinking",
      "Unknown Workflow Dependencies",
      "Unclear Technical Feasibility",
      "Architecture Questions Appearing Too Late",
      "Unclear Delivery Sequencing",
      "Assumptions With No Validation Plan",
    ],
  },
  outcomes: {
    title: "What you should leave discovery with",
    items: [
      { name: "Defined Product Problem", description: "A shared understanding of the problem, users and desired outcome." },
      { name: "MVP Scope", description: "A clear boundary around what belongs in the first useful version." },
      { name: "Prioritized Capabilities", description: "What matters now, what can wait, and why." },
      {
        name: "User / Workflow Understanding",
        description: "The main journeys and operational interactions the product must support.",
      },
      { name: "Technical Direction", description: "Early architectural and integration decisions that affect feasibility." },
      { name: "Risk & Assumption View", description: "Known uncertainties, dependencies and questions to validate." },
      { name: "Delivery Roadmap", description: "A practical sequence from first build toward production." },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      { name: "Problem Framing", description: "Clarify business goals, user needs, constraints and desired outcomes." },
      {
        name: "Workflow Discovery",
        description: "Understand how the current process actually works, including handoffs and pain points.",
      },
      {
        name: "Product Definition",
        description: "Translate the problem into product boundaries, core journeys and capabilities.",
      },
      { name: "MVP Scoping", description: "Separate the essential first release from useful later ideas." },
      {
        name: "Technical Feasibility",
        description: "Identify integration, data, platform, security or architectural constraints early.",
      },
      { name: "Prioritization", description: "Evaluate value, risk, dependency and implementation effort." },
      {
        name: "Architecture Direction",
        description: "Define a sensible initial system direction without prematurely over-designing it.",
      },
      { name: "Delivery Planning", description: "Create a realistic engineering sequence and decision roadmap." },
    ],
  },
  approach: {
    title: "Understand first. Define before building.",
    body: "Discovery follows a focused sequence: understand the business problem, goals, users and constraints; discover existing workflows, pain points, dependencies and opportunities; define the product boundary, MVP, journeys and key capabilities; validate feasibility, risks, assumptions and technical constraints; then plan the architecture direction, delivery sequence and next engineering step. This is a service-specific subset of AROORAA's own delivery lifecycle, not a separate consulting methodology.",
  },
  engineeringProof: {
    title: "Discovery should include engineering reality.",
    items: [
      "Architecture Direction",
      "APIs & Integrations",
      "Data Considerations",
      "Security Boundaries",
      "Scalability Direction",
      "Deployment Constraints",
    ],
  },
  relatedWork: {
    title: "We make the same trade-offs we help clients make.",
    items: [
      { name: "MESA", description: "Complex operational workflows and multi-role restaurant experiences." },
      { name: "Mindra", description: "Personal/private information and shared family workflows." },
      { name: "Smart Mirror", description: "Physical product, ambient computing and edge constraints." },
      { name: "Arooraa Smart Home", description: "Local-first systems, retrofit constraints and safety boundaries." },
    ],
  },
  engagement: {
    title:
      "Discovery Sprint — a focused engagement for turning an idea or problem into a clearer product definition and next engineering step.",
    items: [
      "Discovery Conversations",
      "Workflow Mapping",
      "Product Framing",
      "MVP Definition",
      "Technical Feasibility Review",
      "Architecture Direction",
      "Roadmap / Next-Step Recommendation",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Do I need a fully formed idea before starting?",
        answer: "No. Discovery can begin from a problem, opportunity or rough idea.",
      },
      {
        question: "Is this only for new products?",
        answer: "No. It can also help with major features, workflow redesign, modernization or unclear product direction.",
      },
      {
        question: "Will you design the full architecture during discovery?",
        answer:
          "The goal is enough technical direction to make good product and delivery decisions, not unnecessary detailed design before it's needed.",
      },
      {
        question: "What happens after discovery?",
        answer:
          "The outcome may lead into Product Engineering, AI/Data/Automation, Modernization, Cloud/Platform work, or an internal client team.",
      },
      {
        question: "Can AROORAA continue into implementation?",
        answer:
          "Yes. Discovery can transition into Product Engineering where appropriate, but it should still produce useful clarity even if implementation happens elsewhere.",
      },
    ],
  },
  cta: {
    title: "Have an idea or problem that needs a clearer path?",
    supporting: "Start with what you know today. We can help define what should happen next.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Product Engineering", href: "/services/product-engineering" },
  },
};

/**
 * S3 — Product Engineering. Positioned as end-to-end product engineering
 * ownership (architecture through production), not generic software
 * development, staff augmentation or outsourced developers — see the FAQ's
 * "staff augmentation" answer and the approach's explicit framing as a
 * subset of AROORAA's own shared delivery lifecycle, not a separate
 * methodology. No pricing, no delivered-client metrics — only AROORAA's own
 * products as proof, same discipline as S2/S4.
 */
export const PRODUCT_ENGINEERING_SERVICE_PAGE: ServicePageContent = {
  id: "product-engineering",
  name: "Product Engineering",
  hero: {
    eyebrow: "PRODUCT ENGINEERING",
    title: "From product direction to production-ready software.",
    supporting:
      "We design and engineer web, mobile and platform products with the architecture, user experience, security, quality and cloud foundations needed to operate reliably in the real world.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Explore How We Build", href: "#approach" },
  },
  businessProblem: {
    title: "Shipping software is not the same as engineering a product.",
    body: "A prototype works, but it can't scale safely. UX and backend decisions were made in isolation from each other. Features accumulate without architectural discipline, so every release becomes riskier than the last. Security gets added late instead of designed in from the start. Integrations are fragile, testing is inconsistent, and the production environment is difficult to operate. Ownership ends up fragmented across multiple teams or vendors, with no one accountable for the product as a whole.",
    layout: "featured",
  },
  audience: {
    title: "Who it's for.",
    items: [
      {
        name: "Founders / Product Owners",
        description: "You have a defined product direction and need a reliable engineering partner to build it.",
      },
      {
        name: "Businesses Creating New Digital Products",
        description: "You need web, mobile or platform engineering from architecture through launch.",
      },
      {
        name: "Existing Product Teams",
        description: "You need help delivering a substantial module, integration or new experience.",
      },
      {
        name: "Organizations Replacing Manual Processes",
        description: "You need a production-grade product, not just a proof of concept.",
      },
    ],
  },
  problems: {
    title: "Where product engineering creates clarity",
    items: [
      "Unclear Technical Architecture",
      "Disconnected Frontend / Backend Delivery",
      "Fragile Integrations",
      "Inconsistent Engineering Standards",
      "Slow Release Cycles",
      "Weak Test Coverage",
      "Production Instability",
      "Poor Observability",
      "Security Gaps",
      "Inability to Scale",
      "Technical Decisions Made Too Late",
      "Prototypes That Cannot Become Real Products",
    ],
  },
  outcomes: {
    title: "What good product engineering should create",
    items: [
      { name: "Clear Product Architecture", description: "A system structure aligned to current requirements and future growth." },
      {
        name: "Reliable Product Experience",
        description: "Web/mobile interfaces connected cleanly to real business workflows.",
      },
      {
        name: "Secure Foundations",
        description: "Authentication, authorization, validation and data boundaries designed early.",
      },
      { name: "Production-Ready Delivery", description: "Build, test, deploy and operate the product consistently." },
      { name: "Strong Quality", description: "Automated testing and validation built into engineering, not added at the end." },
      {
        name: "Observable Operations",
        description: "Enough monitoring, logging and operational visibility to understand what is happening in production.",
      },
      { name: "Maintainable Codebase", description: "Clear boundaries and engineering practices that support continued change." },
      {
        name: "Scalable Platform Direction",
        description: "Infrastructure and architecture that can evolve as product usage grows.",
      },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      { name: "Product Architecture", description: "Define system boundaries, interfaces and technical direction." },
      { name: "Backend Engineering", description: "APIs, business logic, services, integrations and reliable data flows." },
      {
        name: "Frontend Engineering",
        description: "Responsive, accessible web experiences and design-system-driven interfaces.",
      },
      { name: "Mobile Engineering", description: "Cross-platform mobile applications and mobile-first product experiences." },
      { name: "Data Engineering", description: "Operational data models, search, caching and product data flows." },
      { name: "Integration Engineering", description: "Connect external systems and business workflows safely." },
      { name: "Security by Design", description: "Authentication, authorization, validation, secrets and auditability." },
      { name: "Quality Engineering", description: "Unit, integration, API, UI/E2E and CI quality gates." },
      { name: "Cloud & Delivery", description: "Build pipelines, containers, deployment, observability and runtime foundations." },
    ],
  },
  collaboration: {
    title: "Strong products come from product thinking and engineering working together.",
    left: { label: "Product Thinking", items: ["Users", "Outcomes", "Scope"] },
    right: { label: "Engineering", items: ["Architecture", "Security", "Quality", "Delivery"] },
  },
  approach: {
    title: "Build the product as a system, not a pile of features.",
    body: "We confirm scope, journeys, boundaries and technical direction; shape the UX, interactions and system interfaces; establish service, data, integration and deployment foundations; engineer the frontend, backend, mobile and integrations; test functionality, integration, security and performance; prepare environments, deployment and production rollout; then monitor, support and continue improving the product after launch. This is a service-specific subset of AROORAA's own delivery lifecycle, not a separate methodology.",
  },
  engineeringProof: {
    title: "Engineering foundations that matter after launch.",
    items: [
      "Modular Architecture",
      "API-First Design",
      "Multi-Tenant Patterns Where Relevant",
      "Role-Based Access",
      "Data Integrity",
      "Idempotent Workflows",
      "Real-Time Communication",
      "Testing Strategy",
      "Observability",
      "CI/CD",
      "Containerized Deployment",
      "Cloud-Ready Operations",
    ],
  },
  relatedWork: {
    title: "We build our own products, so we understand the trade-offs between scope, UX, architecture, quality and production reality.",
    items: [
      { name: "MESA", description: "Multi-role restaurant platform with real-time operational flows." },
      {
        name: "Mindra",
        description: "Mobile-first personal/family product with private and shared information boundaries.",
      },
      { name: "Smart Mirror", description: "Edge/physical product combining Raspberry Pi, UI and ambient computing." },
      {
        name: "Arooraa Smart Home",
        description: "Local-first connected-home prototype combining software, IoT and physical systems.",
      },
    ],
  },
  engagement: {
    title: "Build Engagement — a focused engineering engagement for new products, MVPs or substantial product/platform delivery.",
    items: [
      "Architecture",
      "UX / Technical Design",
      "Frontend / Backend / Mobile Engineering",
      "Integrations",
      "Testing",
      "Security",
      "Deployment",
      "Production Readiness",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Can AROORAA build both frontend and backend?",
        answer: "Yes. Product Engineering can cover frontend, backend, mobile, data and integrations where the engagement requires them.",
      },
      {
        question: "Can you work with an existing product?",
        answer: "Yes. We can deliver new modules, integrations or substantial product improvements without requiring a full rebuild.",
      },
      {
        question: "Do you only build MVPs?",
        answer: "No. Engagements can range from MVPs to production systems and major platform capabilities.",
      },
      {
        question: "Do you handle architecture and deployment too?",
        answer:
          "Yes. Product Engineering includes the technical foundations needed to build and launch reliably; deeper platform work may involve Cloud & Platform Engineering.",
      },
      {
        question: "Can you continue after launch?",
        answer: "Yes. Continuous Engineering can support reliability, maintenance and product evolution.",
      },
      {
        question: "Do you provide staff augmentation?",
        answer:
          "AROORAA's preferred model is product/engineering ownership around defined outcomes rather than supplying individual resources as a commodity service.",
      },
    ],
  },
  cta: {
    title: "Ready to turn the product direction into something real?",
    supporting: "Bring us the scope, the problem or the next product milestone. We'll help engineer the path to production.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Product Strategy & Discovery", href: "/services/product-discovery" },
  },
};

/**
 * S4 — AI, Data & Automation. Positioned as engineering-led (finding where
 * AI creates practical value, then building the systems around it), not as
 * an AI-consulting or generative-AI-agency page. No delivered-client claims,
 * no ROI/accuracy/adoption numbers — "Example Use Cases" and "Related
 * Products / Work" are explicitly labeled/scoped to stay honest about that.
 * The "controlled" framing around agentic workflows (capabilities.
 * "Agentic Workflows" and the dedicated agenticAi section) is deliberate —
 * see agenticAi's body copy for the exact public-safe wording.
 */
export const AI_AUTOMATION_SERVICE_PAGE: ServicePageContent = {
  id: "ai-automation",
  name: "AI, Data & Automation",
  hero: {
    eyebrow: "AI, DATA & AUTOMATION",
    title: "Make intelligence useful.",
    supporting:
      "AROORAA helps businesses identify where AI, data and automation can remove friction, improve decisions and create better digital experiences — then engineers the systems around them.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Explore the Approach", href: "#approach" },
  },
  businessProblem: {
    title: "AI is easy to talk about. Finding where it creates value is harder.",
    body: "Teams spend real time on repetitive work — copying, reviewing, classifying and moving information by hand. Information is often scattered across systems, so people search longer than they should for the right answer. Decisions depend on data that's difficult to use as-is, and workflows move between emails, spreadsheets and applications instead of one clear path. Many businesses experiment with AI without a defined production use case, and prototypes that work in isolation often fail once they're connected to a real process. None of this means AI isn't useful — it means the value has to be found deliberately, not assumed.",
  },
  audience: {
    title: "Who it's for.",
    items: [
      {
        name: "Businesses with Manual Processes",
        description: "Teams repeatedly copy, review, classify or move information by hand.",
      },
      {
        name: "Product Teams Adding Intelligence",
        description: "An existing product needs search, assistants, recommendations, extraction or workflow intelligence.",
      },
      {
        name: "Operations Teams",
        description: "Processes depend on fragmented systems and repetitive coordination between them.",
      },
      {
        name: "Organizations Exploring AI",
        description: "There's interest in AI, but no clear use case, data path or safe implementation approach yet.",
      },
    ],
  },
  problems: {
    title: "Where AI, data and automation create clarity",
    items: [
      "Repetitive Manual Tasks",
      "Difficult Knowledge Retrieval",
      "Disconnected Data",
      "Unstructured Documents & Content",
      "Slow Triage / Classification",
      "Repeated Customer or Employee Questions",
      "Workflow Handoffs",
      "Manual Reporting",
      "Context Scattered Across Systems",
      "AI Prototypes That Aren't Production-Ready",
    ],
    note: "Sometimes the right answer is automation without AI.",
  },
  transformation: {
    title: "From repetitive work to intelligent flow.",
    body: "The most useful systems don't start with a model. They start with a manual step — understand what it actually involves, apply the business rules that already govern it, bring in AI only where it genuinely helps, keep a person in the loop wherever judgment matters, and turn the result into a better workflow or product experience.",
    layout: "featured",
  },
  outcomes: {
    title: "What useful intelligence should create",
    items: [
      { name: "Less Repetitive Work", description: "Reduce time spent on repeatable, information-heavy tasks." },
      { name: "Faster Access to Knowledge", description: "Help people find relevant information with less searching." },
      { name: "Better Workflow Decisions", description: "Bring context closer to the moment where action is needed." },
      { name: "More Useful Products", description: "Add intelligent behavior where it genuinely improves the user experience." },
      {
        name: "Structured Data from Unstructured Information",
        description: "Turn documents, messages or content into usable signals.",
      },
      { name: "Controlled Automation", description: "Automate predictable steps while retaining human review where appropriate." },
      { name: "Measurable Operations", description: "Create clearer visibility into automated workflows and their outcomes." },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      { name: "AI Assistants", description: "Context-aware assistants for products, employees or customer workflows." },
      {
        name: "Retrieval & Knowledge Systems",
        description: "Search, retrieval and grounded-answer experiences over approved information.",
      },
      { name: "Document Intelligence", description: "Extraction, classification, summarization and structured processing." },
      { name: "Workflow Automation", description: "Connect applications, rules and intelligent steps into practical workflows." },
      { name: "Data Engineering", description: "Prepare and organize the data needed for reliable product or automation use." },
      {
        name: "Decision Support",
        description: "Surface useful information and recommendations without hiding the reasoning context.",
      },
      { name: "Agentic Workflows", description: "Use controlled multi-step agents where autonomy adds real value." },
      { name: "AI Product Integration", description: "Embed intelligent capabilities into existing web, mobile or operational products." },
    ],
  },
  collaboration: {
    title: "Automate the repeatable. Keep people in control of what matters.",
    left: { label: "Machine", items: ["Extract", "Classify", "Search", "Suggest", "Automate"] },
    right: { label: "Human", items: ["Review", "Decide", "Approve", "Handle Exceptions", "Own Outcomes"] },
  },
  agenticAi: {
    title: "Agents, used with intention.",
    body: "Some workflows benefit from agents that can reason across multiple steps, use approved tools and coordinate actions. We design these systems with clear boundaries, observability and human intervention where required.",
  },
  dataStory: {
    title: "AI is only as useful as the context around it.",
    body: "Source quality matters — a system is only as trustworthy as what it's grounded in. Permissions matter — access boundaries have to hold even as retrieval gets more capable. Retrieval quality matters, structured data matters, and both evaluation and observability matter, because a system that isn't being measured can't be trusted to stay correct as it changes.",
  },
  intelligenceSystem: {
    title: "How it fits together.",
    body: "At a high level, business data feeds an intelligence layer that searches, extracts, reasons and automates; that layer supports a product or workflow experience; and a human keeps the final control — reviewing, approving or overriding where it matters.",
  },
  examples: {
    title: "What this can look like in practice",
    items: [
      {
        name: "Knowledge Assistant",
        description: "Employees ask questions and receive answers grounded in approved company information.",
      },
      { name: "Document Workflow", description: "Incoming documents are classified, key fields extracted and routed for review." },
      { name: "Product Copilot", description: "An existing application gains context-aware guidance within the workflow." },
      {
        name: "Operations Automation",
        description: "Repeatable steps move automatically between systems, with exceptions surfaced to people.",
      },
      { name: "Intelligent Search", description: "Users find relevant information across fragmented sources more quickly." },
      {
        name: "Content / Data Enrichment",
        description: "Existing records are categorized, summarized or normalized to support downstream workflows.",
      },
    ],
    note: "Illustrative examples of how these capabilities can be applied — not a list of delivered client engagements.",
  },
  approach: {
    title: "Start with the workflow, not the model.",
    body: "We begin by understanding what people do today and where the friction actually is, then identify the specific steps where automation or intelligence would genuinely help. From there we validate data, feasibility, risk and expected value before building anything, prototype the smallest useful proof, engineer the integration, security, controls, evaluation and observability around it, and then measure real use and refine. Choosing a model or tool is never step one.",
  },
  engineeringProof: {
    title: "A prototype is easy. Reliable AI products require engineering around the model.",
    items: [
      "Grounding & Retrieval",
      "Data Quality",
      "Access Control",
      "Prompt / Version Management",
      "Evaluation",
      "Observability",
      "Rate & Cost Controls",
      "Fallback Behavior",
      "Human Review",
      "Security Boundaries",
      "Provider / Model Flexibility",
      "Production Integration",
    ],
  },
  safety: {
    title: "Useful AI needs boundaries.",
    items: [
      "Use Approved Data",
      "Respect User / Tenant Access Boundaries",
      "Make Automated Actions Explicit",
      "Require Human Approval Where Risk Is Meaningful",
      "Evaluate Outputs",
      "Monitor Failures",
      "Avoid Fabricated Certainty",
      "Provide Fallback Paths",
    ],
  },
  relatedWork: {
    title: "We build intelligence into our own products, too.",
    items: [
      { name: "MESA", description: "Operational intelligence and assistance inside real restaurant workflows." },
      {
        name: "Mindra",
        description: "Structured personal and family information, with natural-language interaction as a future direction.",
      },
      { name: "Smart Mirror", description: "Ambient, local/edge intelligence experimentation without cloud dependency." },
      {
        name: "Arooraa Smart Home",
        description: "Local-first automation and future home intelligence, without giving up manual control.",
      },
    ],
  },
  innovation: {
    title: "Where engineering meets imagination.",
    body: "The best intelligent systems combine machine precision with human judgment. We explore AI not as decoration, but as another engineering capability — one that can help products understand, adapt and automate when the problem genuinely calls for it.",
    tone: "dark",
  },
  engagement: {
    title:
      "AI & Automation Discovery / Build Engagement — a focused engagement for finding where AI and automation create real value, then engineering the systems to make it reliable.",
    items: [
      "Workflow Discovery",
      "Use-Case Prioritization",
      "Data / Knowledge Assessment",
      "Feasibility Prototype",
      "AI / Automation Architecture Direction",
      "Product Integration",
      "Evaluation Strategy",
      "Production Hardening",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Do we need to know which AI technology we want?",
        answer: "No. Start with the problem and workflow — the right technology follows from that, not the other way around.",
      },
      {
        question: "Does every automation need AI?",
        answer: "No. Deterministic automation is often the better, more reliable solution.",
      },
      {
        question: "Can AI use our internal company information?",
        answer: "Potentially, when approved sources, access boundaries and the right retrieval/security design are in place.",
      },
      {
        question: "Can AROORAA add AI to an existing product?",
        answer: "Yes. AI can be integrated into existing applications where it adds useful product value.",
      },
      {
        question: "Do you build autonomous AI agents?",
        answer:
          "We can design controlled agentic workflows where they're appropriate, with clear boundaries and human intervention for higher-risk actions.",
      },
      {
        question: "Can AI outputs be trusted completely?",
        answer:
          "No AI system should be treated as universally correct. Evaluation, grounding, controls and appropriate human review remain important.",
      },
    ],
  },
  cta: {
    title: "Have a workflow that feels more manual than it should?",
    supporting:
      "Start with the problem. We'll help determine whether AI, automation, better data — or a simpler engineering solution — is the right next step.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Product Engineering", href: "/services/product-engineering" },
  },
};

/**
 * S5 — Application Modernization. Positioned around a deliberate maturity
 * signal — "modernization is not automatically a rewrite" — rather than a
 * legacy-migration-factory or rewrite-everything framing. Several sections
 * below reuse S4's generically-typed-but-AI-named slots (`dataStory`,
 * `safety`) with their `eyebrow` overridden (S5's own addition to
 * service-page.ts) so the visible label matches this page's content while
 * the underlying shape/position stays exactly as the shared template
 * already defines it — no modernization-specific markup was added to the
 * template. Render order deliberately places the "rewrite vs. evolve"
 * framing (dataStory) right after Capabilities and before Approach, and
 * "Application vs. Platform" (innovation) after the own-product proof —
 * both differ slightly from the brief's suggested rhythm, chosen to fit the
 * template's fixed section order without disturbing any other, already
 * approved, service page (see completion report for the full rationale).
 */
export const APPLICATION_MODERNIZATION_SERVICE_PAGE: ServicePageContent = {
  id: "application-modernization",
  name: "Application Modernization",
  hero: {
    eyebrow: "APPLICATION MODERNIZATION",
    title: "Modernize what holds the product back — preserve what makes it valuable.",
    supporting:
      "We help evolve existing applications, platforms and workflows into systems that are easier to change, integrate, secure, operate and grow — without treating a full rewrite as the default answer.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Explore the Modernization Approach", href: "#approach" },
  },
  businessProblem: {
    title: "When every change feels risky, the application starts controlling the roadmap.",
    body: "Small changes end up touching many parts of the system, so releases become slow and stressful. Important knowledge exists only in a few people's heads. Old interfaces make integrations difficult, and security changes are hard to introduce safely. Testing is weak or highly manual, and production issues are difficult to diagnose. Outdated dependencies block new development, and the application works — but the team is afraid to change it. Cloud, container or platform adoption is difficult because the application was never designed for it. None of this is a judgment on the system; it's a description of where the risk has accumulated.",
  },
  audience: {
    title: "Who it's for.",
    items: [
      {
        name: "Businesses with Critical Existing Applications",
        description: "The system still runs important business processes, but changes are becoming too difficult.",
      },
      {
        name: "Product Teams Limited by Technical Debt",
        description: "New capabilities take longer because architecture, dependencies or testing have become fragile.",
      },
      {
        name: "Organizations Planning Platform or Cloud Change",
        description: "The application needs technical preparation before infrastructure modernization can succeed.",
      },
      {
        name: "Teams Considering a Rewrite",
        description: "You need evidence before deciding whether to refactor, re-platform, replace or progressively rebuild.",
      },
    ],
  },
  problems: {
    title: "Where modernization creates clarity",
    items: [
      "Tightly Coupled Application Logic",
      "Fragile Release Processes",
      "Outdated Frameworks or Dependencies",
      "Difficult Integrations",
      "Weak Automated Testing",
      "Poor Observability",
      "Inconsistent Security Controls",
      "Unclear Architectural Boundaries",
      "Duplicated Business Logic",
      "Difficult Data Movement",
      "Manual Deployment Processes",
      "Cloud / Container Incompatibility",
      "Slow Onboarding for Engineers",
      "Rewrite Decisions Made Without Enough Evidence",
    ],
  },
  transformation: {
    eyebrow: "Controlled Modernization",
    title: "Modernization is not automatically a rewrite.",
    body: "Different parts of an application may need different treatment. Some can remain exactly as they are. Some should be wrapped behind better interfaces. Some can be refactored in place. Some should be extracted into their own boundary. Some may eventually need to be replaced. The right mix depends on where risk, value and change cost actually sit — not on a single universal rule.",
    layout: "featured",
  },
  outcomes: {
    title: "What successful modernization should improve",
    items: [
      { name: "Easier Change", description: "Reduce the number of areas affected by routine product changes." },
      { name: "Safer Releases", description: "Improve testing, deployment discipline and rollback confidence." },
      { name: "Clearer Architecture", description: "Create better boundaries around business capabilities and integrations." },
      {
        name: "Better Integration",
        description: "Make it easier to connect current applications with new products and platforms.",
      },
      {
        name: "Stronger Security Foundations",
        description: "Improve identity, access, secrets, validation and dependency posture where needed.",
      },
      { name: "Better Production Visibility", description: "Introduce useful logs, metrics, tracing and operational diagnostics." },
      { name: "Improved Engineering Productivity", description: "Make the codebase easier to understand, test and evolve." },
      {
        name: "Platform Readiness",
        description: "Prepare the application for containers, cloud or modern delivery environments where appropriate.",
      },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      {
        name: "Application Assessment",
        description: "Understand architecture, dependencies, workflows, risks and operational constraints.",
      },
      { name: "Architecture Refactoring", description: "Improve boundaries and reduce unnecessary coupling." },
      {
        name: "API Enablement",
        description: "Expose useful capabilities through stable interfaces without forcing immediate replacement.",
      },
      {
        name: "Incremental Decomposition",
        description: "Separate selected capabilities when doing so creates meaningful engineering value.",
      },
      {
        name: "Framework & Runtime Modernization",
        description: "Upgrade outdated frameworks, runtimes and dependencies with controlled compatibility testing.",
      },
      {
        name: "Data Modernization",
        description: "Improve data access patterns, migrations and integration boundaries where needed.",
      },
      { name: "Quality Modernization", description: "Introduce automated tests and stronger validation around critical behavior." },
      {
        name: "Security Modernization",
        description: "Strengthen authentication, authorization, secrets, dependency posture and auditability.",
      },
      {
        name: "Delivery Modernization",
        description: "Improve build, CI/CD, containers, environments and production-readiness practices.",
      },
    ],
  },
  dataStory: {
    eyebrow: "Rewrite vs. Evolve",
    title: "Rewrite, refactor or evolve gradually?",
    body: "A full rewrite may be appropriate when the current foundation fundamentally prevents the required product direction, business behavior is understood well enough to reproduce safely, and transition risk can be managed. Incremental modernization may be the better path when the system is business-critical, large portions still work well, risk needs to be reduced gradually, or the business can't stop while a replacement is built. The right answer depends on evidence, not preference.",
  },
  approach: {
    title: "Modernize in controlled steps.",
    body: "We map business-critical workflows, architecture, dependencies and operational constraints; identify where risk, change cost and technical limitations are concentrated; improve tests, observability or delivery safety before major structural change where necessary; introduce clearer interfaces and reduce unnecessary coupling; refactor, upgrade, extract or replace selected areas based on value and risk; confirm business behavior, performance, security and operational readiness; then continue modernizing in increments instead of forcing a single high-risk transformation. This is a service-specific subset of AROORAA's own delivery lifecycle, not a separate methodology.",
  },
  engineeringProof: {
    eyebrow: "Engineering Reality",
    title: "Modernization has to protect business behavior while changing technical foundations.",
    items: [
      "Regression Protection",
      "Backwards Compatibility",
      "Data Migration Safety",
      "API Contracts",
      "Rollback Planning",
      "Dependency Upgrades",
      "Security Boundaries",
      "Production Observability",
      "Phased Release",
      "Performance Validation",
      "Operational Continuity",
    ],
  },
  safety: {
    eyebrow: "Business Knowledge",
    title: "The most valuable part of an old system may not be the code.",
    items: ["Business Rules", "Workflows", "Exceptions", "Operational Knowledge"],
    note: "Years of business rules, exceptions and operational knowledge often live inside existing applications. Modernization needs to uncover and preserve that knowledge before changing the technical structure around it.",
  },
  relatedWork: {
    title:
      "Building and evolving our own products keeps modernization decisions grounded in production reality: architecture boundaries, data integrity, backwards compatibility, deployment safety and what should remain unchanged.",
    items: [
      { name: "MESA", description: "An evolving operational platform requiring careful boundaries across restaurant workflows." },
      {
        name: "Mindra",
        description: "A product where private/shared data behavior and continued product evolution need stable foundations.",
      },
    ],
  },
  innovation: {
    eyebrow: "Application vs. Platform",
    title: "Application modernization and infrastructure modernization are related, but they are not the same thing.",
    body: "Application Modernization is about the code, architecture, dependencies, data and interfaces inside the application itself — plus the quality practices that keep it changeable. Cloud & Platform Engineering is about the runtime, environments, deployment, platform services, observability infrastructure and reliability foundations the application runs on. Sometimes they happen together. Sometimes the application needs to be stabilized first.",
  },
  engagement: {
    title:
      "Modernization Engagement — a focused engagement for understanding an existing application's constraints, defining the right modernization path and implementing change in controlled stages.",
    items: [
      "Application Assessment",
      "Architecture Review",
      "Dependency / Runtime Analysis",
      "Test / Quality Baseline",
      "Modernization Roadmap",
      "Refactoring / Upgrades",
      "API / Integration Enablement",
      "Deployment Modernization",
      "Production Hardening",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Do we need to rewrite our entire application?",
        answer: "No. A full rewrite is only one possible path. Many systems benefit more from incremental modernization.",
      },
      {
        question: "Can you modernize a Java application?",
        answer:
          "Yes. AROORAA has strong backend and Java engineering experience, but the modernization approach should be driven by the application's needs rather than a single technology.",
      },
      {
        question: "Can you modernize without stopping current development?",
        answer:
          "Often, yes. The approach can be structured around incremental changes, compatibility and controlled releases, depending on the system.",
      },
      {
        question: "Can modernization include cloud migration?",
        answer:
          "Yes, where appropriate. Application changes and Cloud & Platform Engineering may be coordinated, but moving an application to cloud infrastructure alone does not automatically modernize it.",
      },
      {
        question: "What if we don't understand the existing architecture well?",
        answer:
          "Assessment is part of the work. Existing code, runtime behavior, workflows and operational knowledge can be studied before major decisions are made.",
      },
      {
        question: "How do you protect existing business functionality?",
        answer:
          "Modernization should establish regression protection, compatibility boundaries and phased validation before replacing critical behavior.",
      },
      {
        question: "Can you modernize only part of the system?",
        answer: "Yes. Modernization can focus on the areas creating the highest product or engineering constraint.",
      },
    ],
  },
  cta: {
    title: "Is your application becoming harder to change than the business around it?",
    supporting:
      "Start with the system you have today. We'll help identify what should stay, what should change and how to modernize without creating unnecessary risk.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Product Engineering", href: "/services/product-engineering" },
  },
};

/**
 * S6 — Cloud & Platform Engineering. Positioned as production platform
 * engineering around real products, not generic cloud migration, DevOps
 * staff augmentation or tool-first "adopt everything" consulting — see the
 * Platform Principle section and the FAQ's Kubernetes answer. Provider-
 * agnostic throughout (no AWS/Azure/GCP naming, no partnership claims), per
 * the brief's explicit instruction to avoid provider keyword-stuffing.
 * Several sections reuse S4's generically-typed-but-AI-named slots
 * (`intelligenceSystem`, `collaboration`, `agenticAi`, `dataStory`,
 * `examples`, `engineeringProof`, `safety`) with `eyebrow` overridden so the
 * visible label matches this page — same pattern established in S5, now
 * extended to ServiceComparisonSection (`collaboration`, used here for a
 * Prevent/Recover reliability split rather than Human + Machine).
 */
export const CLOUD_PLATFORM_SERVICE_PAGE: ServicePageContent = {
  id: "cloud-platform",
  name: "Cloud & Platform Engineering",
  hero: {
    eyebrow: "CLOUD & PLATFORM ENGINEERING",
    title: "Give the product a platform it can rely on.",
    supporting:
      "We design and engineer cloud, deployment and platform foundations that help products move safely from code to production — with clearer environments, stronger reliability and better operational visibility.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Explore the Platform Approach", href: "#approach" },
  },
  businessProblem: {
    title: "When the platform is fragile, every release becomes a product risk.",
    body: "Deployments require manual steps, and environments behave differently from one another. Production configuration is difficult to manage, so teams become afraid to release frequently. Failures are hard to diagnose because application logs are scattered or incomplete. Scaling requires emergency intervention instead of a planned response. Secrets and configuration are handled inconsistently, infrastructure changes are difficult to reproduce, and rollback is unclear when something goes wrong. Teams end up depending on individual operational knowledge, and cloud spend grows without enough visibility into why.",
  },
  audience: {
    title: "Who it's for.",
    items: [
      {
        name: "Product Teams Preparing for Production",
        description: "The application exists, but deployment, environments and operational readiness need stronger foundations.",
      },
      {
        name: "Businesses Growing Existing Platforms",
        description: "Usage, integrations or complexity are increasing beyond the current infrastructure model.",
      },
      {
        name: "Teams Modernizing Delivery",
        description: "Build and release processes are manual, inconsistent or risky.",
      },
      {
        name: "Organizations Moving Toward Cloud Platforms",
        description: "The product needs an infrastructure direction grounded in application and operational needs.",
      },
    ],
  },
  problems: {
    title: "Where platform engineering creates clarity",
    items: [
      "Inconsistent Environments",
      "Manual Deployment",
      "Fragile Release Processes",
      "Configuration Drift",
      "Poor Observability",
      "Unclear Rollback",
      "Unreliable Scaling",
      "Infrastructure Created Manually",
      "Secrets / Configuration Risk",
      "Weak Production Diagnostics",
      "Difficult Service-to-Service Operation",
      "Environment Provisioning Delays",
      "Unclear Platform Ownership",
      "Infrastructure Cost Visibility Gaps",
    ],
  },
  transformation: {
    eyebrow: "Platform Principle",
    title: "Cloud should simplify product delivery, not become another layer of complexity.",
    body: "The goal is not to adopt every platform technology available. The goal is to create the smallest reliable platform foundation the product actually needs — and evolve it as the product grows.",
    layout: "featured",
  },
  outcomes: {
    title: "What good platform engineering should enable",
    items: [
      { name: "Repeatable Delivery", description: "Build and deploy product changes consistently." },
      { name: "Environment Confidence", description: "Reduce unexpected differences between development, test and production." },
      { name: "Faster Recovery", description: "Improve visibility and rollback paths when something goes wrong." },
      { name: "Operational Clarity", description: "Understand application health through useful logs, metrics and alerts." },
      { name: "Secure Configuration", description: "Handle secrets and runtime configuration more deliberately." },
      {
        name: "Reliable Scaling",
        description: "Prepare applications and infrastructure to grow without unnecessary over-engineering.",
      },
      { name: "Reproducible Infrastructure", description: "Define environments in a controlled, repeatable way where appropriate." },
      { name: "Better Cost Awareness", description: "Create clearer visibility into infrastructure use and operational trade-offs." },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      { name: "Cloud Architecture", description: "Define infrastructure and runtime direction based on product needs." },
      { name: "Containerization", description: "Package services for repeatable deployment and environment consistency." },
      { name: "CI/CD Engineering", description: "Automate build, testing, release and deployment workflows." },
      { name: "Infrastructure as Code", description: "Create reproducible infrastructure and configuration where appropriate." },
      {
        name: "Environment Engineering",
        description: "Design development, test, staging and production environments with clear boundaries.",
      },
      { name: "Observability", description: "Implement logs, metrics, tracing and actionable operational visibility." },
      { name: "Reliability Engineering", description: "Design resilience, recovery, health checks and operational safeguards." },
      { name: "Secrets & Configuration", description: "Improve handling of credentials and runtime configuration." },
      {
        name: "Platform Enablement",
        description: "Create reusable delivery/runtime foundations that help engineering teams move faster.",
      },
    ],
  },
  intelligenceSystem: {
    eyebrow: "Environments",
    title: "One product. Different controlled environments.",
    body: "The product keeps the same identity as it moves from development through validation, staging and production — only the configuration changes per environment. Promotion between environments is controlled and repeatable, not manually copied by hand.",
  },
  collaboration: {
    eyebrow: "Reliability",
    title: "Reliability is designed before the incident.",
    left: { label: "Prevent", items: ["Health Checks", "Timeouts", "Retries Where Safe", "Resource Limits", "Capacity Awareness"] },
    right: {
      label: "Recover",
      items: ["Graceful Failure", "Rollback", "Backup / Recovery Planning", "Deployment Safety", "Failure Isolation"],
    },
  },
  agenticAi: {
    eyebrow: "Observability",
    title: "You cannot operate what you cannot see.",
    body: "Useful production visibility may include application health, errors, latency, traffic, resource use, deployment changes, service dependencies and business-critical operational signals. The goal is actionable visibility, not a promised single pane of glass.",
  },
  dataStory: {
    eyebrow: "Scaling Philosophy",
    title: "Scale deliberately, not automatically.",
    body: "Not every product needs complex distributed infrastructure on day one. We design platforms that fit the current product while preserving a practical path to evolve when usage, data or operational complexity grows.",
  },
  examples: {
    eyebrow: "Security by Design",
    title: "Platform security is designed in, not bolted on.",
    items: [
      { name: "Environment Separation", description: "Keep development, test and production boundaries clear." },
      { name: "Least-Privilege Access", description: "Grant only the access a service or person actually needs." },
      { name: "Secrets Management", description: "Handle credentials deliberately, not as plain configuration." },
      { name: "Secure Deployment Credentials", description: "Protect the identities and tokens that release software." },
      { name: "Runtime Configuration", description: "Manage environment-specific settings without exposing them unnecessarily." },
      { name: "Image / Dependency Hygiene", description: "Keep base images and dependencies current and known." },
      { name: "Network Boundaries Where Required", description: "Limit what can reach what, when it matters." },
      { name: "Auditability", description: "Keep a clear record of what changed, when and by whom." },
    ],
  },
  approach: {
    title: "Build the platform around the product.",
    body: "We start by understanding the application's architecture, traffic, data, dependencies and operational expectations; choose the appropriate runtime, environment and delivery direction; create repeatable build, deployment, configuration and infrastructure foundations; introduce useful operational visibility; improve security, recovery and release safety; test deployment, failure and recovery behavior; then continue improving the platform as product usage and operational requirements change. This is a service-specific subset of AROORAA's own delivery lifecycle, not a separate methodology.",
  },
  engineeringProof: {
    eyebrow: "Application vs. Platform",
    title: "Application and platform decisions should support each other.",
    items: [
      "Product / Application Engineering — product behavior, business logic, APIs, frontend/mobile, application architecture",
      "Platform Engineering — runtime, environments, deployment, infrastructure, observability, reliability",
    ],
    note: 'Strong delivery happens when the two are designed together instead of throwing the application "over the wall" to infrastructure.',
  },
  safety: {
    eyebrow: "Beyond CI/CD",
    title: "More than a deployment pipeline.",
    items: ["Environments", "Runtime Behavior", "Observability", "Recovery", "Security", "Engineering Experience"],
    note: "CI/CD is important, but platform engineering also considers all of this — not just the pipeline.",
  },
  relatedWork: {
    title:
      "Running our own products keeps platform decisions grounded in what teams actually need after launch: repeatable releases, reliable runtime behavior and enough visibility to diagnose problems.",
    items: [
      {
        name: "MESA",
        description: "A multi-service operational product where deployment, runtime reliability and service visibility matter.",
      },
      {
        name: "Mindra",
        description: "A web/mobile product requiring predictable application/API environments and operational foundations.",
      },
    ],
  },
  engagement: {
    title:
      "Cloud & Platform Engagement — a focused engagement for establishing or improving the runtime, deployment and operational foundations behind a digital product.",
    items: [
      "Platform Assessment",
      "Cloud / Runtime Architecture",
      "Containerization",
      "CI/CD",
      "Infrastructure as Code",
      "Environment Setup",
      "Observability",
      "Reliability Hardening",
      "Production-Readiness Review",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Do we have to move to the cloud?",
        answer:
          "No. The right platform depends on product, operational and business requirements. Cloud is useful where it provides meaningful value.",
      },
      {
        question: "Do we need Kubernetes?",
        answer: "Not necessarily. Platform complexity should match the product's actual requirements rather than becoming a goal itself.",
      },
      {
        question: "Can you improve our existing CI/CD pipeline?",
        answer: "Yes. Delivery workflows can be reviewed and improved without rebuilding the entire platform.",
      },
      {
        question: "Can you containerize an existing application?",
        answer: "Yes, where containerization improves deployment consistency and operational management.",
      },
      {
        question: "Do you handle monitoring and observability?",
        answer: "Yes. Platform work can include logs, metrics, tracing and actionable production visibility.",
      },
      {
        question: "Can this be combined with Application Modernization?",
        answer:
          "Yes. Application and platform modernization often reinforce each other, but the work should be sequenced based on the application's current risks and constraints.",
      },
      {
        question: "Do you work with specific cloud providers?",
        answer:
          "AROORAA can work with appropriate cloud/platform technologies based on project requirements. Provider partnerships are not presented here unless formally verified.",
      },
    ],
  },
  cta: {
    title: "Does your product need a stronger path from code to production?",
    supporting:
      "We can help establish the platform, delivery and operational foundations needed to release with more confidence and operate with better visibility.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Application Modernization", href: "/services/application-modernization" },
  },
};

/**
 * S7 — Continuous Engineering. Positioned as engineering-led, outcome-owned
 * ongoing product support (observe → triage → prioritize → fix → release →
 * learn → improve), explicitly distinguished from staff augmentation,
 * helpdesk support and generic IT maintenance — see the FAQ's staff-
 * augmentation answer and businessProblem's own framing. This page was
 * deliberately asked to look and feel more distinctive than S2–S6, using
 * the two new opt-in TextBlock capabilities added this milestone:
 * `approach.layout = "featured"` (an asymmetrical split showing the
 * OperatingLoopVisual at real size, not a small companion diagram) and
 * `innovation.tone = "dark"` (a full-width dark "band" moment for the
 * Product Improvement Thought section). No SLA percentages, no guaranteed
 * response times, no 24x7 claims — the FAQ answers stay within those
 * boundaries explicitly.
 */
export const CONTINUOUS_ENGINEERING_SERVICE_PAGE: ServicePageContent = {
  id: "continuous-engineering",
  name: "Continuous Engineering",
  hero: {
    eyebrow: "CONTINUOUS ENGINEERING",
    title: "Keep the product healthy after launch — and improving over time.",
    supporting:
      "AROORAA provides engineering-led ongoing support for digital products in production — helping teams operate reliably, fix issues responsibly, improve product quality, and continue evolving without losing control of the system.",
    primaryCta: { label: "Start a Project", href: "/start-project" },
    secondaryCta: { label: "Explore the Operating Model", href: "#approach" },
  },
  businessProblem: {
    title: "Launch is only the point where real operating discipline begins.",
    body: "Issues keep returning instead of staying fixed. Releases feel risky, and bugs pile up faster than they get resolved. Production behavior is not clearly visible, and no one owns product health end-to-end. Technical debt increases silently in the background. Support stays reactive only, and improvements keep getting postponed indefinitely. Maintenance work ends up disconnected from actual product goals, and product teams are stretched thin after launch — with no clear owner for what happens next.",
  },
  audience: {
    title: "Who it's for.",
    items: [
      {
        name: "Product Teams Already Live in Production",
        description: "The product has shipped, but operating it well has become its own ongoing challenge.",
      },
      {
        name: "Businesses with Customer-Facing Digital Products",
        description: "Reliability, releases and product quality directly affect real users and revenue.",
      },
      {
        name: "Teams Carrying Growing Maintenance and Reliability Pressure",
        description: "The backlog of fixes, debt and small improvements keeps growing faster than it clears.",
      },
      {
        name: "Organizations That Need Ongoing Engineering Without Ad-Hoc Firefighting",
        description: "You want a disciplined operating rhythm, not a string of one-off emergency fixes.",
      },
    ],
  },
  problems: {
    title: "Where continuous engineering creates clarity",
    items: [
      "Production Issues Discovered Too Late",
      "Small Defects Becoming Recurring Support Work",
      "Releases That Create Anxiety",
      "Always Reacting, Rarely Improving",
      "Inconsistent Product Quality",
      "Performance Issues Not Understood Clearly",
      "Technical Debt Slowing Delivery",
      "Scattered Operational Knowledge",
      "Support and Engineering Disconnected",
      "Product Health Invisible to Stakeholders",
      "Reliability Work Competing With Feature Work",
      "Growing Manual Maintenance",
      "Unclear Post-Launch Ownership",
      "Improvements Never Getting Prioritized",
    ],
  },
  collaboration: {
    eyebrow: "The Shift",
    title: "From reactive firefighting to controlled evolution.",
    left: {
      label: "Reactive",
      items: ["Issues Resurface", "Releases Feel Risky", "Support and Engineering Disconnected", "Improvements Postponed Indefinitely"],
    },
    right: {
      label: "Controlled",
      items: ["Issues Triaged and Resolved", "Releases Build Confidence", "Engineering Owns Health End-to-End", "Improvements Happen Continuously"],
    },
  },
  outcomes: {
    title: "What continuous engineering should deliver",
    items: [
      { name: "More Stable Releases", description: "Ship changes with less risk and fewer surprises." },
      { name: "Better Production Visibility", description: "Understand what's actually happening in the running product." },
      { name: "Faster Issue Resolution", description: "Move from signal to fix without unnecessary delay." },
      {
        name: "Reduced Recurring Defects",
        description: "Fix the underlying cause, not just the symptom, so problems stay fixed.",
      },
      {
        name: "Healthier Engineering Rhythm",
        description: "Replace ad-hoc firefighting with a sustainable operating cadence.",
      },
      {
        name: "Better Prioritization",
        description: "Balance maintenance and improvement work deliberately, not by whichever fire is loudest.",
      },
      { name: "Stronger Release Confidence", description: "Release changes knowing what to expect and how to recover if needed." },
      { name: "Ongoing Evolution Without Chaos", description: "Keep improving the product without destabilizing what already works." },
    ],
  },
  capabilities: {
    title: "Capabilities",
    items: [
      { name: "Production Support", description: "Ongoing engineering attention for a product that's already live." },
      {
        name: "Issue Investigation & Resolution",
        description: "Reproduce, understand and resolve issues responsibly, not just patch symptoms.",
      },
      { name: "Release Support", description: "Help changes reach production safely and predictably." },
      { name: "Reliability Improvements", description: "Strengthen the parts of the system that keep failing or causing concern." },
      {
        name: "Performance Monitoring & Optimization",
        description: "Understand and improve how the product behaves under real usage.",
      },
      { name: "Quality Improvement", description: "Raise test confidence and reduce the defects that keep resurfacing." },
      {
        name: "Technical Debt Reduction",
        description: "Pay down the debt that's actively slowing delivery, deliberately and incrementally.",
      },
      { name: "Maintenance Engineering", description: "Keep dependencies, infrastructure and the codebase current and healthy." },
      { name: "Small Feature Evolution", description: "Ship meaningful, incremental improvements without waiting for a large release." },
      { name: "Observability Collaboration", description: "Work with the signals already available to understand production behavior." },
      {
        name: "Incident Learning / Post-Issue Improvement",
        description: "Turn what an issue revealed into a genuine product or process improvement.",
      },
      { name: "Backlog Stabilization", description: "Bring order to a maintenance backlog that's grown faster than it's been cleared." },
    ],
  },
  approach: {
    eyebrow: "Operating Model",
    title: "Observe. Triage. Prioritize. Fix. Release. Learn. Improve.",
    body: 'This is not a new, separate methodology — it\'s a service-specific operating rhythm aligned to AROORAA\'s broader delivery lifecycle. We observe real production behavior, triage what surfaces, prioritize by actual impact, fix issues responsibly, release with confidence, learn from what production teaches us, and feed that learning back into the product as a genuine improvement — then the cycle continues.',
    layout: "featured",
  },
  engineeringProof: {
    title: "This is engineering-led, not a support desk.",
    items: [
      "Release Discipline",
      "Issue Triage & Reproduction",
      "Observability Inputs",
      "Rollback Awareness",
      "Supportability",
      "Maintainability",
      "Test Confidence",
      "Production-Safe Changes",
      "Root Cause Understanding",
      "Operational Documentation",
      "Backlog Hygiene",
      "Incremental Hardening",
    ],
  },
  innovation: {
    eyebrow: "Continuous Improvement",
    title: "Healthy products improve while they operate.",
    body: 'Improvement work shouldn\'t always wait for a future "phase 2." Teams learn something real every time a product runs in production, and that learning is worth acting on. Maintenance, quality and evolution don\'t have to happen in separate tracks — they can happen together, in the same operating rhythm. Small improvements compound over time into a product that keeps getting better, not just staying afloat.',
    tone: "dark",
  },
  relatedWork: {
    title:
      "Working on our own products keeps our understanding of post-launch engineering grounded in real product evolution, operational reality and controlled improvement.",
    items: [
      { name: "MESA", description: "An operational product that keeps evolving under real restaurant usage, not just at launch." },
      { name: "Mindra", description: "A product where reliability and continued evolution matter as much after launch as before it." },
      { name: "Smart Mirror", description: "A physical/edge product where operational behavior is only truly understood in real use." },
      { name: "Arooraa Smart Home", description: "A product designed to keep improving safely without disrupting what already works." },
    ],
  },
  engagement: {
    title:
      "Continuous Engineering Engagement — ongoing engineering support for products already in production, covering reliability, fixes, quality and continuous improvement.",
    items: [
      "Issue Triage",
      "Release Support",
      "Product Health Reviews",
      "Backlog Cleanup",
      "Reliability Improvements",
      "Technical Debt Reduction",
      "Quality Hardening",
      "Performance Follow-Up",
      "Production Behavior Review",
      "Incremental Product Improvement",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Do you only handle bugs and support issues?",
        answer:
          "No. Continuous Engineering also covers release support, reliability improvements, technical debt reduction and ongoing product evolution — not just reactive fixes.",
      },
      {
        question: "Can you continue work on an existing product?",
        answer: "Yes. This is designed for products already in production, whether or not AROORAA built the original system.",
      },
      {
        question: "How is this different from staff augmentation?",
        answer:
          "Continuous Engineering is an outcome-owned operating rhythm — observe, triage, fix, release, learn, improve — not a supply of individual resources billed by the hour.",
      },
      {
        question: "Do you also help with release and deployment confidence?",
        answer: "Yes. Release support and rollback awareness are part of the engagement, not a separate add-on.",
      },
      {
        question: "Can Continuous Engineering include product improvements?",
        answer: "Yes. Improvement work is a core part of the model, not something that only happens after every fix is cleared.",
      },
      {
        question: "What if the product already has technical debt?",
        answer: "That's a common starting point. Debt reduction is addressed deliberately and incrementally, alongside the rest of the operating rhythm.",
      },
      {
        question: "Can this work alongside our internal team?",
        answer: "Yes. The engagement can complement an existing internal team rather than replace it, depending on what the product needs.",
      },
    ],
  },
  cta: {
    title: "Need a stronger way to support, improve and evolve the product after launch?",
    supporting: "Start with where the product is today. We'll help build the operating rhythm that keeps it healthy and moving forward.",
    primary: { label: "Start a Project", href: "/start-project" },
    secondary: { label: "Explore Product Engineering", href: "/services/product-engineering" },
  },
};
