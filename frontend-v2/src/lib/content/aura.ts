export const AURA_HEADING = {
  eyebrow: "Meet Aura",
  title: "Start with the problem. Aura can help you find the next step.",
  description:
    "Aura is AROORAA's conversational assistant. Ask about our products, services or an idea you're exploring, and Aura can help guide you to the right place.",
};

export const AURA_PROMPT_QUESTION = "What are you trying to build or solve?";

/**
 * Static conversation-starter examples (M3D... M3E brief §4/§19) — not
 * functional in this milestone. No AI backend exists yet, so these render as
 * plain text/list content, never as interactive buttons.
 */
export const AURA_EXAMPLE_PROMPTS: string[] = [
  "I have a product idea",
  "Help me choose a service",
  "I need to modernize software",
  "I want to use AI in my business",
  "Tell me about MESA",
  "I want to talk to someone",
];

export const AURA_CTA_LABEL = "Ask Aura";

/**
 * Rendered next to the disabled CTA so the non-interactivity is obvious to
 * sighted users too, not only conveyed through the native disabled state
 * (brief §6: prefer not to link to a fake route, document intended future
 * behavior rather than implying a capability that doesn't exist yet).
 */
export const AURA_PREVIEW_NOTE = "Coming soon";
