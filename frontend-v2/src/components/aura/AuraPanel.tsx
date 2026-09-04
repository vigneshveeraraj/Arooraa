"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AuraGuidedProduct, AuraGuidedService } from "@/lib/aura/guided-entry";
import { describeAuraState, mergeAuraState } from "@/lib/aura/state";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import { voicePresence, type AuraVoiceController } from "@/lib/aura/voice/useAuraVoice";
import type { AuraBriefController } from "@/lib/aura/brief/useAuraBrief";
import dynamic from "next/dynamic";
import { AuraComposer } from "./AuraComposer";
import { AuraAnswerFeedback } from "./AuraAnswerFeedback";
import { AuraBrief } from "./AuraBrief";
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
  /**
   * The voice channel, or null when it is not configured — which is the default. Everything voice
   * adds to this panel is conditional on it, so a deployment with voice off renders exactly the
   * panel A4.2 shipped.
   */
  voice?: AuraVoiceController | null;
  /**
   * The project brief, or null when discovery is not wired up. As with voice, everything it adds
   * is conditional on it, so a panel without one is exactly the panel A5 shipped.
   */
  brief?: AuraBriefController | null;
  /**
   * Records whether an answer was any use. Absent when feedback is not wired up, and then the
   * control simply does not appear — like everything else Aura has gained since A4, it is additive.
   */
  onRate?: (sequence: number, rating: "HELPFUL" | "NOT_HELPFUL") => void;
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
  voice = null,
  brief = null,
  onRate,
}: AuraPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { transcript, state, failure, busy, epoch } = controller;
  const empty = transcript.length === 0;

  // One presence for the visitor to read, out of two sources — see mergeAuraState.
  const latestTurn = latestAuraTurn(transcript);

  const presence = mergeAuraState(state, voice ? voicePresence(voice.status) : null);

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

  /**
   * The one authoritative reset (A5.2.2, owner finding 1). "New" means a genuinely new visitor
   * conversation, and this is the only path to one.
   *
   * <p>Three controllers, because client state about a conversation lives in three places and all
   * three outlive this panel: the conversation itself, the voice channel and the project brief are
   * held above the lazy boundary in {@code AuraWidget} so that closing Aura does not throw a
   * conversation away. Each clears its own state and supersedes its own in-flight requests, so a
   * reply arriving after this — an answer, a transcription, a summary — finds the conversation it
   * belonged to gone and touches nothing.
   *
   * <p>What the composer holds is dealt with differently, and deliberately: rather than reaching
   * into it to blank a field, the epoch re-keys it and React discards the whole component. A
   * draft, a transcript half-applied, the memory of whether the last one came from the microphone
   * — none of it can outlive a reset, including state added to that file later.
   */
  function startNewConversation() {
    controller.startNewConversation();
    voice?.reset();
    brief?.reset();
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

  /*
   * Focus goes straight to the composer when the panel opens: opening Aura is an intent to say
   * something. preventScroll matters — the panel is fixed-position, so without it the browser
   * scrolls the page behind it to "reveal" a textarea that was already fully visible, and the
   * article the visitor was reading jumps out from under them.
   *
   * An empty dependency array, and that is the whole point of this effect being on its own. It
   * used to share one with the key handler below, whose dependency is `onClose` — and once the
   * widget above started rebuilding `onClose` on every render (it closes over the voice
   * controller, which is a fresh object each time), "focus the composer" ran on every render too.
   * With only the composer on screen nobody noticed. The moment the project brief put a contact
   * form in the panel it became unmissable: every keystroke re-rendered, and the re-render pulled
   * focus out of the field and back to the composer, so a visitor could not type their own name.
   */
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("textarea")?.focus({ preventScroll: true });
    // Runs on open, and again after a reset — where it is not a nicety but the fix for a real
    // keyboard trap: the composer is re-keyed by the epoch, so the textarea that had focus has
    // just been unmounted, and focus would otherwise fall to the document body outside the dialog.
    // The epoch changes only when the visitor presses New, so this is still not an effect that
    // re-runs on ordinary renders — which was the point of the empty dependency array, and the
    // reason the project brief's form can be typed into at all.
  }, [epoch]);

  useEffect(() => {
    const panel = panelRef.current;

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
        <AuraMark state={presence} size={26} />
        <div className={styles.identity}>
          <p className={styles.name}>Aura</p>
          <p className={styles.role}>AROORAA digital assistant</p>
        </div>
        {!empty ? (
          <button type="button" className={styles.headerAction} onClick={openGuidedMenu} disabled={busy}>
            Explore
          </button>
        ) : null}
        {/* Available while Aura is still thinking, deliberately (A5.2.2). A visitor who has changed
            their mind should not have to wait for an answer they no longer want, and the reset is
            safe mid-request: the reply that lands afterwards belongs to a conversation that has
            been superseded, and touches nothing. */}
        <button type="button" className={styles.headerAction} onClick={startNewConversation} disabled={empty}>
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
        <AuraDevInspector
          turn={latestTurn}
          defaultOpen={devDiagnosticsOpen}
          voiceTimings={voice?.timings ?? null}
        />
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

              {/* Under the latest answer only, and only while it is still the latest. Feedback
                  controls under every message turn a conversation into a survey; asking once,
                  about the thing just said, is a question rather than a form (A7). */}
              {onRate && message === latestTurn && !message.failed && message.sequence != null && !busy ? (
                <AuraAnswerFeedback
                  key={`feedback-${message.id}`}
                  onRate={(rating) => onRate(message.sequence as number, rating)}
                />
              ) : null}
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

        {/* The brief sits in the conversation flow, after the turn that prompted it, so the
            visitor can still scroll back to what they said while they decide. */}
        {brief ? <AuraBrief controller={brief} conversationId={controller.conversationId} /> : null}

        {/* Offered rather than imposed, and only once the backend agrees this is a project
            conversation with something in it — never one sentence in, and never in a conversation
            about a product. */}
        {brief?.offerSummary && !busy ? (
          <button
            type="button"
            className={styles.briefOffer}
            onClick={() => brief.summarise(controller.conversationId ?? "")}
            disabled={brief.busy}
          >
            {brief.busy ? "Putting that together…" : "Summarise what I've told you"}
          </button>
        ) : null}

        {brief?.error && brief.step === "IDLE" ? (
          <p className={styles.briefNotice}>{brief.error}</p>
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

      {/*
        The panel's one live region, and deliberately the only one. The recording stage has plenty
        to say visually and says none of it here: a level meter that announced itself, or a clock
        that spoke every second, would make the microphone unusable with a screen reader. The first
        microphone use adds its guidance to this same sentence rather than opening a second region
        that would compete with it.
      */}
      <p className={styles.srOnly} role="status">
        {voice?.introducing && voice.status === "LISTENING"
          ? "Aura is recording — speak naturally in your own language"
          : describeAuraState(presence)}
      </p>

      {/*
        Keyed by the epoch, which is the whole of the composer's part in a reset. Everything it
        holds — the draft, and whether that draft came from the microphone — is component state,
        and a changed key throws the component away rather than asking it to tidy itself up.
      */}
      <AuraComposer
        key={epoch}
        onSend={controller.send}
        onActiveChange={controller.markInputActive}
        busy={busy}
        voice={voice}
      />
    </div>
  );
}
