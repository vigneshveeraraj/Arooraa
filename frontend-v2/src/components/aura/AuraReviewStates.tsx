"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { AuraState } from "@/lib/aura/state";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
import { stubAuraVoice } from "@/lib/aura/voice/stub-controller";
import { stubAuraBrief } from "@/lib/aura/brief/stub-controller";
import type { AuraBrief as AuraBriefValue } from "@/lib/aura/brief/brief-client";
import { AuraLauncher } from "./AuraLauncher";
import { AuraMark } from "./AuraMark";
import { AuraPanel } from "./AuraPanel";
import styles from "./AuraReviewStates.module.css";

/**
 * Every Aura state, from the real components and the real stylesheets.
 *
 * <p>A stage sets `transform`, which makes it the containing block for the `position: fixed` panel
 * inside it — so several panels can sit on one page without Aura's own stylesheet needing a
 * review-only branch. Nothing here overrides an Aura style.
 *
 * <p>`?only=<id>` renders a single state alone, filling the viewport. That exists so a screenshot
 * at a given width captures exactly one state with no scrolling — which is how the mobile sheet,
 * sized in dvh, can be photographed at its true size.
 */
function stubController(
  transcript: AuraTranscriptMessage[],
  overrides: Partial<AuraConversationController> = {},
): AuraConversationController {
  return {
    transcript,
    state: "IDLE",
    failure: null,
    busy: false,
    conversationId: "review-conversation",
    send: () => {},
    retryLast: () => {},
    startNewConversation: () => {},
    markInputActive: () => {},
    ...overrides,
  };
}

const GROUNDED: AuraTranscriptMessage[] = [
  { id: "u1", role: "user", text: "What is MESA?" },
  {
    id: "a1",
    role: "aura",
    text:
      "MESA is AROORAA's flagship product — a connected restaurant technology ecosystem that brings " +
      "dine-in, ordering, kitchen and staff operations into one real-time system.\n\n" +
      "It's built as multi-tenant SaaS, so every restaurant runs its own connected environment. " +
      "Is there a particular part of the operation you're trying to join up?",
    sources: [
      { title: "MESA — Restaurant Technology Ecosystem", section: "What MESA does today", sourceUrl: null },
      { title: "AROORAA — Company Overview", section: null, sourceUrl: null },
    ],
  },
];

/**
 * The same turn, carrying the routing metadata the backend returns when its own diagnostics switch
 * is on. Nothing here is visitor-facing: it exists to demonstrate the developer inspector, which is
 * the only surface that reads it.
 */
const GROUNDED_WITH_DIAGNOSTICS: AuraTranscriptMessage[] = [
  GROUNDED[0]!,
  {
    ...GROUNDED[1]!,
    diagnostics: {
      mode: "GROUNDED_QA",
      evidenceLevel: "STRONG_EVIDENCE",
      language: "ENGLISH",
      tone: "NEUTRAL",
      latencyMs: 3739,
    },
  },
];

/** The same grounded answer, numbered — which is what lets feedback name the turn it is about. */
const GROUNDED_NUMBERED: AuraTranscriptMessage[] = [GROUNDED[0]!, { ...GROUNDED[1]!, sequence: 3 }];

/** A short project discussion, so the brief states have a conversation behind them. */
const DISCOVERY: AuraTranscriptMessage[] = [
  { id: "d1", role: "user", text: "I have an app idea. It helps parents manage school schedules." },
  { id: "d2", role: "aura", text: "What are they doing today when a schedule changes?" },
  { id: "d3", role: "user", text: "Right now they use WhatsApp groups and a paper diary, and things get missed." },
  {
    id: "d4",
    role: "aura",
    text: "That is a clear picture. Shall I summarise it back to you, so you can check I understood?",
  },
];

/** What a well-behaved extraction of that conversation looks like. */
const REVIEW_BRIEF: AuraBriefValue = {
  fields: {
    problemStatement: "Parents miss school schedule changes sent over WhatsApp",
    targetUsers: "Parents, and the school office",
    currentSituation: "WhatsApp groups and a paper diary",
    platforms: ["phones", "laptop"],
    unknowns: ["How many schools", "Whether payments are involved"],
    conversationSummary: "An app for parents to manage school schedules.",
  },
  status: "SUMMARISED",
  readyToSummarise: true,
  handoffAvailable: true,
};

const BOUNDARY: AuraTranscriptMessage[] = [
  { id: "u2", role: "user", text: "What database does MESA use internally?" },
  {
    id: "a2",
    role: "aura",
    text:
      "That one's on the private side of the line for me \u{1F642} — but if you're weighing the same " +
      "decision for your own system, I'd genuinely enjoy digging into that with you.",
  },
];

const FAILED: AuraTranscriptMessage[] = [
  { id: "u3", role: "user", text: "What is AROORAA?" },
  {
    id: "a3",
    role: "aura",
    text: "I can't reach AROORAA from here right now. Check your connection and try again?",
    failed: true,
  },
];

const MARK_STATES: AuraState[] = [
  "IDLE",
  "INPUT_ACTIVE",
  "LISTENING",
  "PROCESSING_AUDIO",
  "THINKING",
  "SPEAKING",
  "RESPONSE_READY",
  "ERROR",
];

function panel(key: string, node: ReactNode) {
  return (
    <div key={key} className={styles.stage}>
      {node}
    </div>
  );
}

interface ReviewState {
  id: string;
  title: string;
  note: ReactNode;
  frame: ReactNode;
}

const STATES: ReviewState[] = [
  {
    id: "mark",
    title: "The mark",
    note: "One abstract presence, five states. Motion is restrained and stops entirely under prefers-reduced-motion; colour still carries the state.",
    frame: (
      <ul className={styles.marks}>
        {MARK_STATES.map((state) => (
          <li key={state}>
            <AuraMark state={state} size={40} />
            <code>{state}</code>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "launcher",
    title: "Closed — the launcher",
    note: "The Aura Spark, lower-right, safe-area aware, one line of type. Reads as a presence you can address rather than a support widget.",
    frame: (
      <div className={styles.stage} data-frame="launcher">
        <AuraLauncher onOpen={() => {}} state="IDLE" panelId="review-1" buttonRef={{ current: null }} />
      </div>
    ),
  },
  {
    id: "first-open",
    title: "First open — guided entry",
    note: "A deliberate opening rather than an empty composer: Products, Services, a project idea, or About — with two quieter escape hatches below.",
    frame: panel(
      "first-open",
      <AuraPanel
        id="review-2"
        onClose={() => {}}
        controller={stubController([])}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "products",
    title: "Guided entry — Products",
    note: "Every destination here comes from the same route data the site's own Products page uses — public names only, short approved taglines.",
    frame: panel(
      "products",
      <AuraPanel
        id="review-products"
        onClose={() => {}}
        controller={stubController([])}
        onNavigate={() => {}}
        initialGuidedSection="products"
      />,
    ),
  },
  {
    id: "services",
    title: "Guided entry — Services",
    note: "The six approved service groups, and none besides.",
    frame: panel(
      "services",
      <AuraPanel
        id="review-services"
        onClose={() => {}}
        controller={stubController([])}
        onNavigate={() => {}}
        initialGuidedSection="services"
      />,
    ),
  },
  {
    id: "grounded",
    title: "Grounded answer — what a visitor actually sees",
    note: "The answer, and nothing else. This turn carries two citations and full routing metadata; neither reaches the panel.",
    frame: panel(
      "grounded",
      <AuraPanel
        id="review-3"
        onClose={() => {}}
        controller={stubController(GROUNDED_WITH_DIAGNOSTICS)}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "inspector",
    title: "The same grounded answer, with the developer inspector open",
    note: "Where citations and routing metadata live now (A4.2). One collapsed disclosure describing the latest turn, never a block under every answer — and no public build contains it.",
    frame: panel(
      "inspector",
      <AuraPanel
        id="review-4"
        onClose={() => {}}
        controller={stubController(GROUNDED_WITH_DIAGNOSTICS)}
        onNavigate={() => {}}
        devDiagnostics
        devDiagnosticsOpen
      />,
    ),
  },
  {
    id: "voice-first-open",
    title: "First open, with voice available",
    note: "A5.2: no permanent language row. The guided entry is the four openings and nothing else — the language guidance moved to the one moment it matters, which is the first time somebody reaches for the microphone.",
    frame: panel(
      "voice-first-open",
      <AuraPanel
        id="review-voice-1"
        onClose={() => {}}
        controller={stubController([])}
        onNavigate={() => {}}
        voice={stubAuraVoice()}
      />,
    ),
  },
  {
    id: "voice-first-listening",
    title: "First microphone use",
    note: "Recording replaces the composer rather than tinting a button, because the owner could not tell from a tinted button whether Aura was hearing anything. Four independent answers to “is this working?” — the Spark listening, a meter that moves with the room, a clock counting up, and the word itself. The language line appears here, once per browser.",
    frame: panel(
      "voice-first-listening",
      <AuraPanel
        id="review-voice-2a"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({
          status: "LISTENING",
          introducing: true,
          elapsedSeconds: 3,
          subscribeToLevel: hearing(0.55),
        })}
      />,
    ),
  },
  {
    id: "voice-listening",
    title: "Recording, every time after the first",
    note: "The same stage without the introduction: a visitor who has spoken to Aura before goes straight into listening. Cancel discards the recording without uploading anything; Done stops and transcribes.",
    frame: panel(
      "voice-listening",
      <AuraPanel
        id="review-voice-2"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({ status: "LISTENING", elapsedSeconds: 8, subscribeToLevel: hearing(0.82) })}
      />,
    ),
  },
  {
    id: "voice-processing",
    title: "Working out what was said",
    note: "“Understanding”, in the visitor's language rather than ours. No provider name, no “transcribing”, no upload vocabulary — which half of the sentence is our implementation is not something anybody came here to learn.",
    frame: panel(
      "voice-processing",
      <AuraPanel
        id="review-voice-2b"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({ status: "PROCESSING", elapsedSeconds: 8 })}
      />,
    ),
  },
  {
    id: "voice-canonical-transcript",
    title: "A misheard product name, corrected before anyone sends it",
    note: "The visitor said MESA and speech-to-text returned “Meesa”. Aura writes its own public names its own way and puts the result in the composer, where the visitor reads it and presses send — nothing is submitted for them. Only names in the approved registry are ever touched.",
    frame: panel(
      "voice-canonical-transcript",
      <AuraPanel
        id="review-voice-2c"
        onClose={() => {}}
        controller={stubController([])}
        onNavigate={() => {}}
        voice={stubAuraVoice({ transcript: { id: 1, text: "Tell me about MESA" } })}
      />,
    ),
  },
  {
    id: "voice-speaking",
    title: "Speaking, with a way to stop it",
    note: "Aura reads an answer aloud only when asked — by turning speech on, or by having asked the question out loud. Stopping is always one tap away.",
    frame: panel(
      "voice-speaking",
      <AuraPanel
        id="review-voice-3"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({ status: "SPEAKING", speakAnswers: true })}
      />,
    ),
  },
  {
    id: "voice-countdown",
    title: "Recording, near the ceiling",
    note: "The countdown joins the elapsed clock only in the last few seconds, so an ordinary question never feels timed — and stopping is never a surprise. The meter follows what the microphone is actually hearing, which is what Aura does instead of guessing when someone has finished.",
    frame: panel(
      "voice-countdown",
      <AuraPanel
        id="review-voice-5"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({
          status: "LISTENING",
          elapsedSeconds: 52,
          secondsLeft: 8,
          subscribeToLevel: hearing(0.34),
        })}
      />,
    ),
  },
  {
    id: "voice-replay",
    title: "Just after Aura finished speaking",
    note: "One offer, for the turn it just read, gone the moment anything else happens — so “say that again” is there when it is wanted and never a permanent control.",
    frame: panel(
      "voice-replay",
      <AuraPanel
        id="review-voice-6"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({ replayable: true, speakAnswers: true })}
      />,
    ),
  },
  {
    id: "voice-denied",
    title: "Microphone permission refused",
    note: "Never left in the listening state: the stage closes, the composer is right there, and the sentence is Aura's own — no permission API, no browser error name, nothing that reads as the visitor's mistake.",
    frame: panel(
      "voice-denied",
      <AuraPanel
        id="review-voice-4"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        onNavigate={() => {}}
        voice={stubAuraVoice({
          error:
            "Microphone access is needed to talk with Aura. You can allow it in your browser, or just type.",
        })}
      />,
    ),
  },
  {
    id: "brief-summary",
    title: "What Aura understood",
    note: "Only what the visitor actually said — a field Aura does not have is simply not there — and, separately, the things it noticed it does not know. That last line is the most useful part of a brief and the opposite of a gap.",
    frame: panel(
      "brief-summary",
      <AuraPanel
        id="review-brief-1"
        onClose={() => {}}
        controller={stubController(DISCOVERY)}
        onNavigate={() => {}}
        brief={stubAuraBrief({ step: "SUMMARY", brief: REVIEW_BRIEF })}
      />,
    ),
  },
  {
    id: "brief-consent",
    title: "Asking permission, in plain words",
    note: "The question is the whole screen. No form shares it, so nothing else can be mistaken for the answer — and giving contact details afterwards is never what said yes.",
    frame: panel(
      "brief-consent",
      <AuraPanel
        id="review-brief-2"
        onClose={() => {}}
        controller={stubController(DISCOVERY)}
        onNavigate={() => {}}
        brief={stubAuraBrief({ step: "CONSENT", brief: REVIEW_BRIEF })}
      />,
    ),
  },
  {
    id: "brief-contact",
    title: "Only what the team needs in order to reply",
    note: "Four fields and a preference. No budget, no company size, no role — none of which anybody needs in order to answer somebody.",
    frame: panel(
      "brief-contact",
      <AuraPanel
        id="review-brief-3"
        onClose={() => {}}
        controller={stubController(DISCOVERY)}
        onNavigate={() => {}}
        brief={stubAuraBrief({ step: "CONTACT", brief: REVIEW_BRIEF })}
      />,
    ),
  },
  {
    id: "brief-sent",
    title: "With the team",
    note: "The reference from the existing Start Project workflow — the same one the website's own form produces, because it is the same workflow.",
    frame: panel(
      "brief-sent",
      <AuraPanel
        id="review-brief-4"
        onClose={() => {}}
        controller={stubController(DISCOVERY)}
        onNavigate={() => {}}
        brief={stubAuraBrief({
          step: "SENT",
          brief: REVIEW_BRIEF,
          enquiryReference: "ARO-2026-000042",
        })}
      />,
    ),
  },
  {
    id: "feedback",
    title: "Asked once, about the thing just said",
    note: "Under the latest answer only, and gone the moment the visitor says anything else. Two choices, because “was this any use?” has two answers — and no box to justify a no in before we will accept it.",
    frame: panel(
      "feedback",
      <AuraPanel
        id="review-feedback"
        onClose={() => {}}
        controller={stubController(GROUNDED_NUMBERED)}
        onNavigate={() => {}}
        onRate={() => {}}
      />,
    ),
  },
  {
    id: "thinking",
    title: "Thinking",
    note: "Real answers take 1–4s. A moving mark and one word, not a spinner.",
    frame: panel(
      "thinking",
      <AuraPanel
        id="review-5"
        onClose={() => {}}
        controller={stubController([{ id: "u4", role: "user", text: "What can AROORAA build?" }], {
          busy: true,
          state: "THINKING",
        })}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "error",
    title: "Error, with a retry",
    note: "Aura’s own voice, never a stack trace or a status code — and the visitor’s message stays put.",
    frame: panel(
      "error",
      <AuraPanel
        id="review-6"
        onClose={() => {}}
        controller={stubController(FAILED, {
          state: "ERROR",
          failure: {
            ok: false,
            kind: "NETWORK",
            message: "I can't reach AROORAA from here right now.",
            retryable: true,
          },
        })}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "boundary",
    title: "Internal boundary — no sources at all",
    note: "A boundary turn is answered warmly and grounds nothing — and reads as an answer, with no label saying which mode produced it.",
    frame: panel(
      "boundary",
      <AuraPanel
        id="review-7"
        onClose={() => {}}
        controller={stubController(BOUNDARY)}
        onNavigate={() => {}}
      />,
    ),
  },
];

/**
 * A microphone that is hearing something, held at a fixed loudness.
 *
 * <p>The meter is driven by a subscription rather than by React state, so with a stub controller it
 * would otherwise sit at its resting profile in every capture — truthful for a browser with no
 * analyser, and not what the owner is reviewing. This publishes one value on subscribe, which is
 * exactly what the real meter does ten times a second.
 */
function hearing(level: number) {
  return (listener: (value: number) => void) => {
    listener(level);
    return () => {};
  };
}

/** The phone the mobile sheet is reviewed at by default — iPhone 14/15 logical size. */
const PHONE = { width: 390, height: 844 };

/**
 * The widths the sheet has to hold at: the narrowest phone still in use, the small iPhone, the
 * default above, and a large Android. `?device=widths` frames the same state at all four, which is
 * how "it works on mobile" gets checked as something other than a single lucky viewport.
 */
const REVIEW_WIDTHS = [320, 375, 390, 430];

export function AuraReviewStates({ bannerClassName }: { bannerClassName?: string }) {
  const [query, setQuery] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    // Read from the URL rather than a router hook: this is a static page, and useSearchParams
    // would drag a Suspense boundary into a review harness for no benefit.
    //
    // This state genuinely has to be set after mount. The page is statically exported, so `window`
    // does not exist when it is prerendered; a lazy useState initializer would therefore produce
    // one tree on the server and a different one on the client — a hydration mismatch, not a saved
    // render. Hence the suppression rather than a rewrite.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setQuery(new URLSearchParams(window.location.search));
  }, []);

  // Nothing at all until the URL has been read.
  //
  // Rendering the full list first and narrowing to one state a moment later is what put a ghost in
  // every `?only=` screenshot: a panel from the wide layout was painted, the page then narrowed,
  // and the compositor never repainted the now-blank region it had been in, so a stale close
  // button sat in the margin of captures from A4.1 onwards. The DOM was always correct — only the
  // picture was wrong, which is the worst kind of thing to leave in owner-facing evidence.
  //
  // An empty first paint costs nothing here (this page is internal, and it is JavaScript that
  // decides what it shows) and it means there is no earlier layout for a tile to go stale from.
  if (query === null) return null;

  const only = query.get("only");
  const device = query.get("device");

  /*
   * Mobile is reviewed through an iframe, not by resizing the window. An iframe is its own
   * viewport, so the panel's 600px breakpoint and its dvh height both evaluate against 390×844
   * exactly as they would on a phone — and it works in a plain browser and in a screenshot alike.
   */
  // The banner would otherwise repeat inside every phone frame, and push the sheet out of view.
  const banner = only ? null : (
    <div className={bannerClassName}>
      Internal Aura visual review — not part of public navigation. Remove before production cutover.
    </div>
  );

  if (device === "widths") {
    // One state, four viewports. Defaults to the grounded answer, which is the longest thing the
    // sheet has to lay out; `?device=widths&only=first-open` checks the guided menu instead.
    const state = STATES.find((candidate) => candidate.id === (only ?? "grounded")) ?? STATES[0]!;
    return (
      <div className={styles.phones}>
        {banner}
        {REVIEW_WIDTHS.map((width) => (
          <figure key={width} className={styles.phone}>
            <figcaption>
              {width}px — {state.title}
            </figcaption>
            <iframe
              title={`Aura at ${width}px — ${state.title}`}
              src={`?only=${state.id}`}
              width={width}
              height={PHONE.height}
            />
          </figure>
        ))}
      </div>
    );
  }

  if (device === "mobile") {
    return (
      <div className={styles.phones}>
        {banner}
        {STATES.filter((state) => state.id !== "mark").map((state) => (
          <figure key={state.id} className={styles.phone}>
            <figcaption>{state.title}</figcaption>
            <iframe
              title={`Aura on mobile — ${state.title}`}
              src={`?only=${state.id}`}
              width={PHONE.width}
              height={PHONE.height}
            />
          </figure>
        ))}
      </div>
    );
  }

  const shown = only ? STATES.filter((state) => state.id === only) : STATES;

  return (
    <div className={styles.page} data-mode={only ? "solo" : "all"}>
      {banner}
      {only ? null : (
        <header className={styles.intro}>
          <h1 className="text-h1">Aura — visual review</h1>
          <p className={styles.lead}>
            Every state the owner needs to judge, from the real components and the real stylesheets.
            Add <code>?only=grounded</code> to see one state alone, filling the viewport,{" "}
            <code>?device=mobile</code> to see every state at 390×844, or{" "}
            <code>?device=widths</code> to see one state at 320, 375, 390 and 430 — each framed in
            its own viewport, so the mobile sheet is genuinely the mobile sheet rather than a
            narrowed desktop panel.
          </p>
          <p className={styles.lead}>
            The developer inspector is the only state here that a visitor never sees. Everything
            else is exactly what the public panel renders.
          </p>
        </header>
      )}

      {shown.map((state) => (
        <section className={styles.section} id={state.id} key={state.id}>
          {only ? null : (
            <>
              <h2 className="text-h3">{state.title}</h2>
              <p className={styles.note}>{state.note}</p>
            </>
          )}
          {state.frame}
        </section>
      ))}
    </div>
  );
}
