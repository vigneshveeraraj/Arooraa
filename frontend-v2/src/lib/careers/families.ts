/**
 * The six career families (W3.3A §5) — a storytelling/navigation taxonomy,
 * distinct from the coarser JobTeam filter in types.ts (Engineering there
 * covers both the backend and frontend families here). Each links to the
 * one role most representative of that path; CareerFamiliesSection derives
 * each family's open-role count from the live job dataset rather than
 * hardcoding it.
 */

export type CareerFamilyId =
  | "ai-data"
  | "backend-engineering"
  | "frontend-engineering"
  | "product-design"
  | "sales"
  | "marketing-growth";

export interface CareerFamily {
  id: CareerFamilyId;
  name: string;
  description: string;
  relatedJobSlug: string;
}

export const CAREER_FAMILIES: CareerFamily[] = [
  {
    id: "ai-data",
    name: "AI & Data",
    description:
      "Build intelligent capabilities that turn information, workflows and product context into useful assistance and automation.",
    relatedJobSlug: "ai-engineer",
  },
  {
    id: "backend-engineering",
    name: "Backend & Full Stack Engineering",
    description: "Build reliable product foundations, APIs, services and end-to-end application capabilities.",
    relatedJobSlug: "java-full-stack-engineer",
  },
  {
    id: "frontend-engineering",
    name: "Frontend Engineering",
    description: "Build responsive, accessible and polished product experiences across modern web applications.",
    relatedJobSlug: "react-frontend-engineer",
  },
  {
    id: "product-design",
    name: "Product Design",
    description: "Turn complicated problems and workflows into interfaces people can understand and enjoy using.",
    relatedJobSlug: "ui-ux-product-designer",
  },
  {
    id: "sales",
    name: "Sales",
    description:
      "Understand customer problems, create meaningful conversations and connect the right AROORAA capability to real business needs.",
    relatedJobSlug: "sales-business-development",
  },
  {
    id: "marketing-growth",
    name: "Marketing & Growth",
    description: "Help the market understand what AROORAA builds, why it matters and where our products can create value.",
    relatedJobSlug: "marketing-growth-executive",
  },
];
