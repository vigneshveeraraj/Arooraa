"use client";

import styles from "./AuraSpeakerButton.module.css";

interface AuraSpeakerButtonProps {
  speakAnswers: boolean;
  onChange: (speak: boolean) => void;
}

/**
 * Whether Aura reads its answers out loud. Off until asked, and remembered in this browser only.
 *
 * <p>A toggle rather than a per-answer play button, because the question a visitor is answering is
 * "do I want to be talked to", not "do I want to hear this particular paragraph". Turning it off
 * also stops whatever is playing, which is what someone reaching for it mid-sentence means.
 */
export function AuraSpeakerButton({ speakAnswers, onChange }: AuraSpeakerButtonProps) {
  return (
    <button
      type="button"
      className={styles.speaker}
      data-on={speakAnswers ? "true" : undefined}
      onClick={() => onChange(!speakAnswers)}
      aria-pressed={speakAnswers}
      aria-label={speakAnswers ? "Stop reading answers aloud" : "Read answers aloud"}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M4 8h2.4L10 4.8v10.4L6.4 12H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="currentColor" />
        {speakAnswers ? (
          <path
            d="M12.6 7.4a3.6 3.6 0 0 1 0 5.2M14.9 5.1a6.9 6.9 0 0 1 0 9.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M13 8l4 4M17 8l-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </button>
  );
}
