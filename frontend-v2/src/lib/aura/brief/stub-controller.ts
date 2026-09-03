import type { AuraBriefController } from "./useAuraBrief";

/**
 * A brief controller that holds a fixed state and does nothing.
 *
 * <p>Exists so the design-system review page can photograph each step of the handoff — summary,
 * consent, contact, sent — without a backend, and so a component test can render one step at a
 * time. Imports no test framework, so the review page can use it without dragging one into the
 * bundle; nothing in the public panel imports it, so it never reaches a visitor.
 */
export function stubAuraBrief(overrides: Partial<AuraBriefController> = {}): AuraBriefController {
  return {
    offerSummary: false,
    step: "IDLE",
    brief: null,
    busy: false,
    error: null,
    errorField: null,
    enquiryReference: null,
    refresh: () => {},
    summarise: () => {},
    acceptSummary: () => {},
    reviseSummary: () => {},
    giveConsent: () => {},
    send: () => {},
    dismiss: () => {},
    ...overrides,
  };
}
