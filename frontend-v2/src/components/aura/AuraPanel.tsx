"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AuraGuidedProduct, AuraGuidedService } from "@/lib/aura/guided-entry";
import { describeAuraState } from "@/lib/aura/state";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import dynamic from "next/dynamic";
import { AuraComposer } from "./AuraComposer";
import { AuraGuidedEntry, type AuraGuidedSection } from "./AuraGuidedEntry";
import { AuraMark } from "./AuraMark";
import { AuraRichText } from "./AuraRichText";
import styles from "./AuraPanel.module.css";

interface AuraPanelProps {
  id: string;
  onClose: () => void;
  controller: AuraConversationController;
  /**
   * Shows the developer inspector above the conversation. Off everywhere a visitor can reach:
   * {@code AuraWidget} passes a gate that is false in any production build, and the design-system
   * review page passes it explicitly because that page exists to demonstrate it.
   */
  devDiagnostics?: boolean;
  /** Only the design-system review page sets this — opens the inspector so a capture shows it. */
  devDiagnosticsOpen?: boolean;
  /** Client-side navigation for guided-entry destinations. Never authorization, never DOM/page
   * content — a plain route the visitor chose from a fixed menu. */
  onNavigate: (href: string) => void;
  /** Only the design-system review page sets this — seeds the guided menu's nested level so the
   * Products/Services submenus can be captured directly instead of requiring a click first. */
  initialGuidedSection?: AuraGuidedSection;
}

/**
 * Imported on demand rather than statically, so the inspector's code is not merely unrendered on a
 * public page — it is in a chunk that page never asks for. Without this it would ride along inside
 * the panel bundle every visitor downloads when they open Aura, which is a weaker guarantee than
 * the one A4.2 is meant to give.
 */
const AuraDevInspector = dynamic(
  () => import("./AuraDevInspector").then((module) => module.AuraDevInspector),
  { ssr: false },
);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

/** How close to the bottom still counts as "following along", in px. */
const STICK_TO_BOTTOM_PX = 48;

/** The turn the developer inspector describes: the most recent thing Aura said. */
function latestAuraTurn(transcript: AuraConversationController["transcript"]) {
  for (let index = transcript.length - 1; index >= 0; index -= 1) {
    const message = transcript[index];
    if (message?.role === "aura") return message;
  }
  return null;
}

/**
 * The open conversation. A dialog on both desktop and mobile, but a different shape on each: a
 * bounded panel in the corner where there is room for the page behind it, and a sheet that owns
 * the viewport where there is not (see AuraPanel.module.css).
 *
 * <p>Holds no conversation state of its own — the controller lives in {@code AuraWidget}, above
 * the lazy boundary, so closing and reopening does not lose a conversation and this file stays
 * about presentation.
 *
 * <p>What a visitor sees is exactly their message, Aura's answer, and the composer (A4.2). No
 * citations, no routing metadata, no evidence vocabulary — that material is still tracked and
 * still returned by the backend, but the only surface that renders it is
 * {@link AuraDevInspector}, which no public build contains.
 */
export function AuraPanel({
  id,
  onClose,
  controller,
  devDiagnostics = false,
  devDiagnosticsOpen = false,
  onNavigate,
  initialGuidedSection,
}: AuraPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { transcript, state, failure, busy } = controller;
  const empty = transcript.length === 0;

  // The guided menu owns two small pieces of presentation state: whether it is showing at all, and
  // which level. It reopens on a genuinely empty conversation (including after "New") and collapses
  // the moment any real turn is added — sent from the composer or from a guided choice alike — so
  // one rule covers both. "Explore" (below) is the only other way it opens.
  const [guidedOpen, setGuidedOpen] = useState(empty);
  const [guidedSection, setGuidedSection] = useState<AuraGuidedSection>(initialGuidedSection ?? "root");

  // Adjusted during render rather than in an effect (React's own sanctioned pattern for state
  // derived from a prop change) so collapsing the menu happens in the same commit as the message
  // that caused it, with no extra render in between.
  const [trackedTranscriptLength, setTrackedTranscriptLength] = useState(transcript.length);
  if (transcript.length !== trackedTranscriptLength) {
    const previousLength = trackedTranscriptLength;
    setTrackedTranscriptLength(transcript.length);
    if (transcript.length === 0) {
      setGuidedOpen(true);
      setGuidedSection("root");
    } else if (transcript.length > previousLength) {
      setGuidedOpen(false);
    }
  }

  function focusComposer() {
    panelRef.current?.querySelector<HTMLElement>("textarea")?.focus({ preventScroll: true });
  }

  function openGuidedMenu() {
    setGuidedSection("root");
    setGuidedOpen(true);
  }

  function dismissGuidedMenu() {
    setGuidedOpen(false);
    focusComposer();
  }

  function selectProduct(product: AuraGuidedProduct) {
    onNavigate(product.href);
    controller.send(`Tell me about ${product.name}`);
  }

  function selectService(service: AuraGuidedService) {
    onNavigate(service.href);
    controller.send(`Tell me about ${service.name}`);
  }

  function startIdea() {
    // Finding 2: no navigation here — the idea itself is the whole point of this choice, and it
    // begins PROJECT_DISCOVERY the same way a visitor typing it themselves would.
    controller.send("I have a product idea.");
  }

  function navigateOnly(href: string) {
    onNavigate(href);
    setGuidedOpen(false);
  }

  useEffect(() => {
    const panel = panelRef.current;
    // Focus goes straight to the composer: opening Aura is an intent to say something. preventScroll
    // matters — the panel is fixed-position, so without it the browser scrolls the page behind it to
    // "reveal" a textarea that was already fully visible, and the article the visitor was reading
    // jumps out from under them. Inlined rather than routed through the focusComposer() helper
    // below: this effect's dependency array is deliberately just [onClose].
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

  // Follows the conversation as it grows, but only while the visitor is already at the bottom.
  // Scrolling back to re-read an earlier answer and being yanked back down when the next one
  // lands is the behaviour this guard exists to prevent; a long grounded answer makes that easy
  // to hit. Layout effect so the jump, when it does happen, lands before paint.
  const stickToBottom = useRef(true);

  function trackScrollPosition() {
    const log = logRef.current;
    if (!log) return;
    const distanceFromBottom = log.scrollHeight - log.scrollTop - log.clientHeight;
    stickToBottom.current = distanceFromBottom < STICK_TO_BOTTOM_PX;
  }

  useLayoutEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [transcript.length, busy]);

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
        {!empty ? (
          <button type="button" className={styles.headerAction} onClick={openGuidedMenu} disabled={busy}>
            Explore
          </button>
        ) : null}
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

      {devDiagnostics ? (
        <AuraDevInspector turn={latestAuraTurn(transcript)} defaultOpen={devDiagnosticsOpen} />
      ) : null}

      {/* Announced politely so a screen reader hears each answer without losing the visitor's place. */}
      <div
        className={styles.log}
        ref={logRef}
        onScroll={trackScrollPosition}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {transcript.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className={styles.userRow}>
              <p className={styles.userMessage}>{message.text}</p>
            </div>
          ) : (
            <div key={message.id} className={styles.auraRow} data-failed={message.failed ? "true" : undefined}>
              {/* Aura's turn is the answer and nothing else. Its sources and diagnostics travel on
                  the message object and are read by the developer inspector above, never here. */}
              <AuraRichText text={message.text} />
            </div>
          ),
        )}

        {guidedOpen ? (
          <AuraGuidedEntry
            section={guidedSection}
            withWelcome={empty}
            onOpenSection={setGuidedSection}
            onBack={() => setGuidedSection("root")}
            onSelectProduct={selectProduct}
            onSelectService={selectService}
            onStartIdea={startIdea}
            onNavigateOnly={navigateOnly}
            onDismiss={dismissGuidedMenu}
          />
        ) : null}

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
