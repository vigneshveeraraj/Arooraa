"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./AuraComposer.module.css";

interface AuraComposerProps {
  onSend: (message: string) => void;
  onActiveChange: (active: boolean) => void;
  busy: boolean;
}

/** Grows with the message, up to a point — past this the textarea scrolls instead of eating the panel. */
const MAX_ROWS_PX = 132;

export function AuraComposer({ onSend, onActiveChange, busy }: AuraComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy;

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

  function submit() {
    if (!canSend) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter writes a newline. Composition (an IME mid-word, which Tamil input
    // uses) must never be interrupted by a send.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className={styles.srOnly} htmlFor="aura-composer-input">
        Message Aura
      </label>
      <textarea
        id="aura-composer-input"
        ref={textareaRef}
        className={styles.input}
        rows={1}
        value={value}
        placeholder="Ask Aura something…"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onActiveChange(true)}
        onBlur={() => onActiveChange(false)}
      />
      <button type="submit" className={styles.send} disabled={!canSend} aria-label="Send message">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path
            d="M3.4 9.2 16.1 3.5c.6-.3 1.2.3.9.9L11.3 17c-.3.6-1.1.5-1.3-.1l-1.5-4.6a.7.7 0 0 0-.5-.5L3.5 10.5c-.6-.2-.7-1-.1-1.3Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
}
