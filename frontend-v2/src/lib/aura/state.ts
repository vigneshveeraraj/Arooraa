/**
 * What Aura is doing, as one value.
 *
 * <p>Small on purpose. A4 renders it as a few degrees of movement in an abstract mark; the reason
 * it exists as a named model rather than a couple of booleans is that a later milestone replaces
 * that mark with something far more expressive, and the presence layer should not have to be
 * re-derived from `isLoading` when it does.
 */
export type AuraState = "IDLE" | "INPUT_ACTIVE" | "THINKING" | "RESPONSE_READY" | "ERROR";

/** How long the "just answered" acknowledgement lasts before settling back to idle. */
export const RESPONSE_READY_MS = 1400;

/** A short, human label for assistive technology — the mark itself is decorative. */
export function describeAuraState(state: AuraState): string {
  switch (state) {
    case "THINKING":
      return "Aura is thinking";
    case "RESPONSE_READY":
      return "Aura has replied";
    case "ERROR":
      return "Aura ran into a problem";
    case "INPUT_ACTIVE":
      return "Aura is listening";
    default:
      return "Aura is ready";
  }
}
