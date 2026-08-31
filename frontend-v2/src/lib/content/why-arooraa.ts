export const WHY_AROORAA_HEADING = {
  eyebrow: "Why AROORAA",
  title: "We build products ourselves — and bring that thinking to yours.",
};

export interface Differentiator {
  number: string;
  title: string;
  description: string;
}

/** The six frozen differentiators (M3D brief §13) — do not replace with generic values language. */
export const DIFFERENTIATORS: Differentiator[] = [
  {
    number: "01",
    title: "We build our own products",
    description:
      "We experience the full journey ourselves — decisions, architecture, development, deployment and evolution.",
  },
  {
    number: "02",
    title: "Architecture before implementation",
    description: "We understand the problem before choosing technology.",
  },
  {
    number: "03",
    title: "Senior engineering involvement",
    description: "Important technical decisions stay close to experienced engineering leadership.",
  },
  {
    number: "04",
    title: "End-to-end ownership",
    description: "From idea or problem through production and support.",
  },
  {
    number: "05",
    title: "Product thinking",
    description: "We focus on users, operations and business outcomes, not only tickets and features.",
  },
  {
    number: "06",
    title: "AI when it adds value",
    description: "We use AI where it genuinely improves the product or process, not as a marketing label.",
  },
];
