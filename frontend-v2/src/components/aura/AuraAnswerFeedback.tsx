"use client";

import { useState } from "react";
import styles from "./AuraAnswerFeedback.module.css";

interface AuraAnswerFeedbackProps {
  /** Sends the vote. Failures are the caller's to swallow — see below. */
  onRate: (rating: "HELPFUL" | "NOT_HELPFUL") => void;
}

/**
 * Two small marks under the most recent answer, and nothing else.
 *
 * <p>Restraint is most of the design here. Feedback controls under every message turn a
 * conversation into a survey, so this appears under the <em>latest</em> answer only, and vanishes
 * as soon as the visitor says anything else — they have moved on, and the question has expired.
 *
 * <p>Two choices rather than five stars. "Was this any use?" has two answers; a scale invites a
 * shrug in the middle and tells nobody anything. There is no follow-up question either: a visitor
 * who taps "not helpful" has already given us the fact worth having, and asking them to type a
 * reason before we accept it is a toll on the person who was already let down.
 *
 * <p>Once tapped it becomes a thank-you rather than a pair of buttons, so nobody wonders whether it
 * registered — and so nobody taps twice to be sure.
 */
export function AuraAnswerFeedback({ onRate }: AuraAnswerFeedbackProps) {
  const [rated, setRated] = useState<"HELPFUL" | "NOT_HELPFUL" | null>(null);

  function rate(rating: "HELPFUL" | "NOT_HELPFUL") {
    setRated(rating);
    onRate(rating);
  }

  if (rated) {
    return (
      <p className={styles.thanks} role="status">
        {rated === "HELPFUL" ? "Glad that helped." : "Thanks — that's useful to know."}
      </p>
    );
  }

  return (
    <div className={styles.feedback}>
      <span className={styles.prompt} id="aura-feedback-prompt">
        Was that useful?
      </span>
      <button
        type="button"
        className={styles.choice}
        onClick={() => rate("HELPFUL")}
        aria-describedby="aura-feedback-prompt"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M5.5 14V6.8L8.6 2c.8 0 1.4.7 1.3 1.5L9.5 6h3.1c.9 0 1.6.8 1.4 1.7l-.9 4.9c-.1.8-.8 1.4-1.6 1.4H5.5ZM3.6 6.8H2v7.2h1.6V6.8Z"
            fill="currentColor"
          />
        </svg>
        Yes
      </button>
      <button
        type="button"
        className={styles.choice}
        onClick={() => rate("NOT_HELPFUL")}
        aria-describedby="aura-feedback-prompt"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M10.5 2v7.2L7.4 14c-.8 0-1.4-.7-1.3-1.5l.4-2.5H3.4c-.9 0-1.6-.8-1.4-1.7l.9-4.9C3 2.6 3.7 2 4.5 2h6ZM12.4 9.2H14V2h-1.6v7.2Z"
            fill="currentColor"
          />
        </svg>
        No
      </button>
    </div>
  );
}
