export interface CapabilityGroup {
  id: string;
  name: string;
  items: string[];
}

export const ENGINEERING_HEADING = {
  eyebrow: "Engineering",
  title: "Built on strong engineering foundations.",
  description:
    "Product thinking matters, but reliable products also need the right architecture, data, cloud, security and quality foundations.",
};

/** Explicitly not "Partners" — no partnership/certification status exists (M3D brief §5). */
export const ENGINEERING_LABEL = "Technologies we engineer with";

/**
 * The nine frozen capability groups (M3D brief §3/§4) — do not add a tenth or
 * split these further. Items are the brief's own bullets, Title Cased for
 * consistent badge display.
 */
export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: "architecture",
    name: "Architecture",
    items: [
      "Modular Systems",
      "Multi-Tenant SaaS",
      "APIs",
      "Event-Driven Patterns",
      "Distributed Systems",
      "Edge & Connected Systems",
    ],
  },
  {
    id: "backend",
    name: "Backend",
    items: ["Java", "Spring", "REST APIs", "Messaging & Integration Patterns"],
  },
  {
    id: "frontend",
    name: "Frontend",
    items: ["React", "Next.js", "Angular", "TypeScript"],
  },
  {
    id: "mobile",
    name: "Mobile",
    items: ["React Native / Expo", "Cross-Platform Applications"],
  },
  {
    id: "data",
    name: "Data",
    items: ["PostgreSQL", "Redis", "Search / Vector Data", "Operational Data Design"],
  },
  {
    id: "ai",
    name: "AI",
    items: ["LLM Integration", "RAG", "AI Assistants", "AI Workflows", "Local / Private AI"],
  },
  {
    id: "cloud",
    name: "Cloud",
    items: ["Docker", "Kubernetes", "CI/CD", "Nginx", "Observability", "Cloud Deployment"],
  },
  {
    id: "security",
    name: "Security",
    items: [
      "Authentication / Authorization",
      "Tenant Isolation",
      "Secrets Management",
      "Validation",
      "Rate Limiting",
      "Auditability",
      "Least Privilege",
    ],
  },
  {
    id: "quality",
    name: "Quality",
    items: [
      "Unit Testing",
      "Integration Testing",
      "API Testing",
      "UI / E2E Testing",
      "Performance & Security Validation",
      "CI Quality Gates",
    ],
  },
];
