export interface DeliveryStage {
  number: string;
  name: string;
  description: string;
}

export const HOW_WE_WORK_HEADING = {
  eyebrow: "Our Approach",
  title: "From problem to production — and beyond.",
  description: "We stay involved across the product lifecycle instead of disappearing after development.",
};

/** The frozen nine-stage delivery lifecycle (M3C brief §13) — order must not change. */
export const DELIVERY_STAGES: DeliveryStage[] = [
  { number: "01", name: "Understand", description: "Understand the business problem, goals, users and constraints." },
  { number: "02", name: "Discover", description: "Explore workflows, opportunities, risks and feasibility." },
  { number: "03", name: "Define", description: "Define MVP scope, architecture, roadmap and delivery boundaries." },
  { number: "04", name: "Design", description: "Design the experience, flows and system interactions." },
  { number: "05", name: "Build", description: "Engineer the product using the right technologies and architecture." },
  {
    number: "06",
    name: "Validate",
    description: "Test functionality, integrations, quality, security and performance.",
  },
  { number: "07", name: "Launch", description: "Prepare infrastructure, deployment and production rollout." },
  { number: "08", name: "Operate", description: "Monitor, support and maintain the product in production." },
  { number: "09", name: "Evolve", description: "Use feedback, data and new requirements to keep improving it." },
];
