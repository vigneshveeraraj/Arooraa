import type { CardAccent } from "./shared/SelectableCard";

/** Shared palette cycled across the Step 1 card grids (W3.2A §8: "varied
 * subtle accent colors") — plain data, not CSS classes, since the accent is
 * applied via CSS custom properties (see SelectableCard). */
export const CARD_ACCENTS: CardAccent[] = [
  { color: "var(--color-accent)", background: "rgba(42, 53, 156, 0.1)" },
  { color: "#2f6fed", background: "rgba(47, 111, 237, 0.12)" },
  { color: "#0f8f9e", background: "rgba(15, 143, 158, 0.12)" },
  { color: "#b8790a", background: "rgba(184, 121, 10, 0.12)" },
  { color: "#2f8f5b", background: "rgba(47, 143, 91, 0.12)" },
  { color: "#7c5cbf", background: "rgba(124, 92, 191, 0.12)" },
];
