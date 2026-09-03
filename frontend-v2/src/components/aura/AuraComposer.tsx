"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { AuraMessageSource } from "@/lib/aura/useAuraConversation";
import type { AuraVoiceController } from "@/lib/aura/voice/useAuraVoice";
import { AuraListening } from "./AuraListening";
import { AuraMicButton } from "./AuraMicButton";
import { AuraSpeakerButton } from "./AuraSpeakerButton";
import styles from "./AuraComposer.module.css";

interface AuraComposerProps {
  onSend: (message: string, source?: AuraMessageSource) => void;
  onActiveChange: (active: boolean) => void;
  busy: boolean;
  /** Absent when voice is not configured, which is the default — see useAuraVoice. */
  voice?: AuraVoiceController | null;
}

/** Grows with the message, up to a point — past this the textarea scrolls instead of eating the panel. */
const MAX_ROWS_PX = 132;

export function AuraComposer({ onSend, onActiveChange, busy, voice }: AuraComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy;

  // A transcript arrives as a value with an id rather than through a callback, so applying it is
  // an ordinary render-time adjustment (React's own sanctioned pattern for state derived from a
  // changing prop) instead of an effect that would land a render late. The id is what
  // distinguishes a new transcript from a re-render carrying the same one.
  const [appliedTranscriptId, setAppliedTranscriptId] = useState(0);
  // Whether what is in the box came from the microphone. Kept across edits on purpose: a visitor
  // who spoke and then fixed one word still asked out loud, and should still be answered out loud.
  const [draftFromVoice, setDraftFromVoice] = useState(false);

  const transcript = voice?.transcript ?? null;
  if (transcript && transcript.id !== appliedTranscriptId) {
    setAppliedTranscriptId(transcript.id);
    setDraftFromVoice(true);
    // Appended rather than replacing, so a half-typed thought is not silently destroyed by a
    // recording the visitor started to finish it.
    setValue((current) => (current.trim().length > 0 ? `${current.trim()} ${transcript.text}` : transcript.text));
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const content = textarea.scrollHeight;
    textarea.style.height = `${Math.min(content, MAX_ROWS_PX)}px`;
    // A textarea reserves scrollbar chrome the moment overflow is `auto`, so on Windows a
    // one-line message sat next to a pair of native scroll arrows. Overflow is switched on only
    // once the message has genuinely outgrown the box — scoped to this element, so nothing else
    // on the site loses a scrollbar.
    textarea.style.overflowY = content > MAX_ROWS_PX ? "auto" : "hidden";
  }, [value]);

  // Focus follows a transcript into the box, so the visitor can correct a misheard word without
  // reaching for the textarea first.
  useEffect(() => {
    if (transcript) textareaRef.current?.focus({ preventScroll: true });
  }, [transcript]);

  function submit() {
    if (!canSend) return;
    onSend(value, draftFromVoice ? "VOICE" : "TYPED");
    setValue("");
    setDraftFromVoice(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter writes a newline. Composition (an IME mid-word, which Tamil input
    // uses) must never be interrupted by a send.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  const recording = voice?.status === "LISTENING" || voice?.status === "REQUESTING";
  const processing = voice?.status === "PROCESSING";
  const speaking = voice?.status === "SPEAKING";
  const notice = voice?.error ?? null;

  /*
   * The composer is unmounted while the recording stage is up, and a textarea that never blurs is
   * a textarea the conversation still believes has focus — which would leave the Spark in
   * INPUT_ACTIVE after a cancelled recording. React fires no blur on unmount, so this says it.
   */
  const listeningRef = useRef(false);
  useEffect(() => {
    const listening = recording || processing;
    if (listening === listeningRef.current) return;
    listeningRef.current = listening;
    if (listening) {
      onActiveChange(false);
    } else {
      // Focus was on Done, which has just gone. Without this it falls to the document body and the
      // panel's Tab cycle loses its visitor; the composer is also where they are going next.
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [onActiveChange, processing, recording]);

  if (voice && (recording || processing)) {
    return (
      <div className={styles.dock}>
        <AuraListening
          status={voice.status as "REQUESTING" | "LISTENING" | "PROCESSING"}
          introducing={voice.introducing}
          elapsedSeconds={voice.elapsedSeconds}
          secondsLeft={voice.secondsLeft}
          onDone={voice.stopListening}
          onCancel={voice.cancelListening}
          subscribeToLevel={voice.subscribeToLevel}
        />
      </div>
    );
  }

  return (
    <div className={styles.dock}>
      {/*
        One thin strip, and only when there is genuinely something to say. Anything permanent here
        would make the panel busier for every visitor in exchange for a state most of them are
        never in.
      */}
      {notice ? (
        <p className={styles.notice} data-tone="error">
          <span>{notice}</span>
          <button type="button" className={styles.noticeAction} onClick={() => voice?.dismissError()}>
            Dismiss
          </button>
        </p>
      ) : speaking ? (
        <p className={styles.notice}>
          <span>Aura is speaking.</span>
          <button type="button" className={styles.noticeAction} onClick={() => voice?.stopSpeaking()}>
            Stop
          </button>
        </p>
      ) : voice?.replayable ? (
        // Only for the turn Aura just read out, and gone the moment anything else happens — so
        // "say that again" is there when it is wanted and never a permanent control.
        <p className={styles.notice}>
          <span>Aura read that aloud.</span>
          <button type="button" className={styles.noticeAction} onClick={() => voice.replay()}>
            Play again
          </button>
        </p>
      ) : null}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {voice?.speechAvailable ? (
          <AuraSpeakerButton speakAnswers={voice.speakAnswers} onChange={voice.setSpeakAnswers} />
        ) : null}

        <label className={styles.srOnly} htmlFor="aura-composer-input">
          Message Aura
        </label>
        <textarea
          id="aura-composer-input"
          ref={textareaRef}
          className={styles.input}
          rows={1}
          value={value}
          // Shortened in A5.1. With the speaker and microphone in the row, "Ask Aura something…"
          // wrapped to two lines inside the box at 320px and made the resting composer taller on
          // the narrowest phone. The label above is what assistive technology reads either way.
          placeholder="Ask Aura…"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onActiveChange(true)}
          onBlur={() => onActiveChange(false)}
        />

        {voice?.available ? <AuraMicButton onStart={voice.startListening} busy={busy} /> : null}

        <button type="submit" className={styles.send} disabled={!canSend} aria-label="Send message">
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M3.4 9.2 16.1 3.5c.6-.3 1.2.3.9.9L11.3 17c-.3.6-1.1.5-1.3-.1l-1.5-4.6a.7.7 0 0 0-.5-.5L3.5 10.5c-.6-.2-.7-1-.1-1.3Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
