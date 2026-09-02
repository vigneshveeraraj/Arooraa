/**
 * The four openings offered on an empty conversation.
 *
 * <p>They are messages, not navigation. Pressing one sends exactly this text through the same path
 * a typed message takes, so the reply is a real grounded answer rather than a scripted card — and
 * each is phrased the way a visitor would actually put it, which also means each lands in a
 * different Aura mode (grounded, discovery, consulting, modernization).
 */
export const AURA_STARTER_PROMPTS: readonly string[] = [
  "Explore MESA",
  "I have a product idea",
  "What can AROORAA build?",
  "Help modernize my software",
];
