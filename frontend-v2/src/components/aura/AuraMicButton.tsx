"use client";

import styles from "./AuraMicButton.module.css";

interface AuraMicButtonProps {
  onStart: () => void;
  /** True while a message is being answered — one thing at a time. */
  busy: boolean;
}

/**
 * The way in to voice: one button, in the composer row, that starts recording.
 *
 * <p>Tap rather than hold. Hold-to-talk is the more obvious gesture and the wrong one here: it
 * cannot be operated from a keyboard without inventing a key-down/key-up convention nobody knows,
 * it fails on touch the moment a finger drifts off the button, and it makes a long sentence into a
 * physical endurance task.
 *
 * <p>A5.2 took the other half of its job away, and the button is better for it. It used to also
 * <em>be</em> the recording indicator — same 44px square, tinted red, with a ring that followed the
 * microphone level — and the owner's finding was that this is not enough to tell whether Aura is
 * actually listening. Recording now has a surface of its own ({@link AuraListening}), which
 * replaces the composer while it is up, so this button is only ever seen in one state and says one
 * thing.
 */
export function AuraMicButton({ onStart, busy }: AuraMicButtonProps) {
  return (
    <button
      type="button"
      className={styles.mic}
      onClick={onStart}
      disabled={busy}
      aria-label="Start voice input"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <rect x="7.25" y="2" width="5.5" height="10" rx="2.75" fill="currentColor" />
        <path
          d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  );
}
