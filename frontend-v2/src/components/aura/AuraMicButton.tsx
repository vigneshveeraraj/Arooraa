"use client";

import type { AuraVoiceStatus } from "@/lib/aura/voice/useAuraVoice";
import styles from "./AuraMicButton.module.css";

interface AuraMicButtonProps {
  status: AuraVoiceStatus;
  onStart: () => void;
  onStop: () => void;
  /** True while a message is being answered — one thing at a time. */
  busy: boolean;
}

const RECORDING_STATES: AuraVoiceStatus[] = ["REQUESTING", "LISTENING"];

/**
 * Push to talk, as a tap rather than a hold.
 *
 * <p>Hold-to-talk is the more obvious gesture and the wrong one here. It cannot be operated from a
 * keyboard without inventing a key-down/key-up convention nobody knows; it fails on touch the
 * moment a finger drifts off the button; and it makes a long sentence into a physical endurance
 * task. Tap to start, tap to stop — the same control, in two states, reachable by Tab and Enter
 * like everything else in the panel.
 */
export function AuraMicButton({ status, onStart, onStop, busy }: AuraMicButtonProps) {
  const recording = RECORDING_STATES.includes(status);
  const processing = status === "PROCESSING";

  return (
    <button
      type="button"
      className={styles.mic}
      data-recording={recording ? "true" : undefined}
      onClick={recording ? onStop : onStart}
      disabled={busy || processing}
      // The accessible name changes with the state, so a screen-reader user always hears what the
      // button will do next rather than what it is called. `aria-pressed` carries the state
      // itself, which is what makes the two readable together.
      aria-pressed={recording}
      aria-label={
        recording
          ? "Stop recording and transcribe"
          : processing
            ? "Working out what you said"
            : "Speak to Aura — English, Tamil or Tanglish"
      }
    >
      {processing ? (
        <span className={styles.working} aria-hidden="true" />
      ) : (
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
      )}
    </button>
  );
}
