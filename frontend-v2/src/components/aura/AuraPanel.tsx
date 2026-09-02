"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { describeAuraState } from "@/lib/aura/state";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import { AuraComposer } from "./AuraComposer";
import { AuraMark } from "./AuraMark";
import { AuraRichText } from "./AuraRichText";
import { AuraSources } from "./AuraSources";
import { AURA_STARTER_PROMPTS } from "./starter-prompts";
import styles from "./AuraPanel.module.css";

interface AuraPanelProps {
  id: string;
  onClose: () => void;
  controller: AuraConversationController;
  diagnosticsEnabled: boolean;
  /** Only the design-system review page sets this. */
  expandSources?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

/**
 * The open conversation. A dialog on both desktop and mobile, but a different shape on each: a
 * bounded panel in the corner where there is room for the page behind it, and a sheet that owns
 * the viewport where there is not (see AuraPanel.module.css).
 *
 * <p>Holds no conversation state of its own — the controller lives in {@code AuraWidget}, above
 * the lazy boundary, so closing and reopening does not lose a conversation and this file stays
 * about presentation.
 */
export function AuraPanel({ id, onClose, controller, diagnosticsEnabled, expandSources = false }: AuraPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { transcript, state, failure, busy } = controller;

  useEffect(() => {
    const panel = panelRef.current;
    // Focus goes straight to the composer: opening Aura is an intent to say something. preventScroll
    // matters — the panel is fixed-position, so without it the browser scrolls the page behind it to
    // "reveal" a textarea that was already fully visible, and the article the visitor was reading
    // jumps out from under them.
    panel?.querySelector<HTMLElement>("textarea")?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      // Focus stays inside the dialog while it is open, and Escape is always the way out — the
      // combination a keyboard user needs for this not to become a trap.
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Follows the conversation as it grows. Layout effect so the jump happens before paint.
  useLayoutEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [transcript.length, busy]);

  const empty = transcript.length === 0;

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      role="dialog"
      aria-modal="false"
      aria-label="Aura, AROORAA's digital assistant"
    >
      <header className={styles.header}>
        <AuraMark state={state} size={26} />
        <div className={styles.identity}>
          <p className={styles.name}>Aura</p>
          <p className={styles.role}>AROORAA digital assistant</p>
        </div>
        <button
          type="button"
          className={styles.headerAction}
          onClick={controller.startNewConversation}
          disabled={busy || empty}
        >
          New
        </button>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close Aura">
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </header>

      {/* Announced politely so a screen reader hears each answer without losing the visitor's place. */}
      <div className={styles.log} ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
        {empty ? (
          <div className={styles.intro}>
            <p className={styles.introText}>
              Hi — I&rsquo;m Aura. I can help you explore AROORAA, MESA, our engineering services, or
              think through a product idea.
            </p>
            <ul className={styles.starters}>
              {AURA_STARTER_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    className={styles.starter}
                    onClick={() => controller.send(prompt)}
                    disabled={busy}
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {transcript.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className={styles.userRow}>
              <p className={styles.userMessage}>{message.text}</p>
            </div>
          ) : (
            <div key={message.id} className={styles.auraRow} data-failed={message.failed ? "true" : undefined}>
              <AuraRichText text={message.text} />
              {message.sources && message.sources.length > 0 ? (
                <AuraSources sources={message.sources} defaultExpanded={expandSources} />
              ) : null}
              {diagnosticsEnabled && message.diagnostics ? (
                <p className={styles.diagnostics}>
                  {[
                    message.diagnostics.mode,
                    message.diagnostics.evidenceLevel,
                    message.diagnostics.language,
                    message.diagnostics.tone,
                    message.diagnostics.latencyMs != null ? `${message.diagnostics.latencyMs}ms` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          ),
        )}

        {busy ? (
          <div className={styles.thinking}>
            <AuraMark state="THINKING" size={16} />
            <span>Thinking…</span>
          </div>
        ) : null}

        {failure?.retryable && !busy ? (
          <button type="button" className={styles.retry} onClick={controller.retryLast}>
            Try again
          </button>
        ) : null}
      </div>

      <p className={styles.srOnly} role="status">
        {describeAuraState(state)}
      </p>

      <AuraComposer onSend={controller.send} onActiveChange={controller.markInputActive} busy={busy} />
    </div>
  );
}
