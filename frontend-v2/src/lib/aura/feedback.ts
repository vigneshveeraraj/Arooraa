import { auraConversationsUrl } from "./client";

/**
 * Telling aura-service whether an answer was any use.
 *
 * <p>Fire and forget, deliberately. A visitor who taps "no" has done us a favour; if the request
 * fails there is nothing useful to say to them about it and nothing for them to do, so the tap is
 * acknowledged in the UI either way and the failure is ours alone. Every other Aura client returns
 * failures as values because the UI has to render something for them — this one does not, because
 * it does not.
 *
 * <p>Nothing comes back. There is no endpoint to read feedback, so this cannot be used to find out
 * what anybody else thought of an answer.
 */
export type AuraFeedbackRating = "HELPFUL" | "NOT_HELPFUL";

export interface AuraFeedbackClient {
  rate(conversationId: string, sequence: number, rating: AuraFeedbackRating): void;
}

const TIMEOUT_MS = 10_000;

export function createAuraFeedbackClient(): AuraFeedbackClient {
  return {
    rate(conversationId, sequence, rating) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      void fetch(
        `${auraConversationsUrl()}/${encodeURIComponent(conversationId)}/messages/${sequence}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
          signal: controller.signal,
        },
      )
        .catch(() => {
          // Nothing to tell the visitor, and nothing for them to do about it.
        })
        .finally(() => clearTimeout(timer));
    },
  };
}
