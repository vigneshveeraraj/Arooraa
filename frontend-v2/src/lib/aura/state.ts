/**
 * What Aura is doing, as one value.
 *
 * <p>Small on purpose. A4 renders it as a few degrees of movement in an abstract mark; the reason
 * it exists as a named model rather than a couple of booleans is that a later milestone replaces
 * that mark with something far more expressive, and the presence layer should not have to be
 * re-derived from `isLoading` when it does.
 *
 * <p>A5 adds the three voice states. They are part of the same enum rather than a parallel one
 * because they are the same presence: a visitor watching the Spark should see one thing that is
 * listening, thinking or speaking, not two indicators competing to describe the same moment.
 */
export type AuraState =
  | "IDLE"
  | "INPUT_ACTIVE"
  | "LISTENING"
  | "PROCESSING_AUDIO"
  | "THINKING"
  | "RESPONSE_READY"
  | "SPEAKING"
  | "ERROR";

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
    case "LISTENING":
      // Deliberately different wording from INPUT_ACTIVE above, which means "the composer has
      // focus". This one means a microphone is actually recording, and a screen-reader user must
      // be able to tell those two apart without looking.
      return "Aura is recording — speak now";
    case "PROCESSING_AUDIO":
      return "Aura is working out what you said";
    case "SPEAKING":
      return "Aura is speaking";
    default:
      return "Aura is ready";
  }
}

/**
 * One presence out of two independent sources. The conversation controller knows about thinking
 * and failing; the voice controller knows about recording, transcribing and speaking. They can
 * both be non-idle at once — a visitor can interrupt Aura mid-sentence by tapping the microphone —
 * so something has to decide, once, which one the mark shows.
 *
 * <p>Voice wins wherever it has something to say, because voice states are things the visitor is
 * doing right now and the conversation states are things happening on our side. The exception is
 * ERROR: a failed turn is the more important fact, and it is what the visitor needs to act on.
 */
export function mergeAuraState(conversation: AuraState, voice: AuraState | null): AuraState {
  if (conversation === "ERROR") return "ERROR";
  if (voice && voice !== "IDLE") return voice;
  return conversation;
}
