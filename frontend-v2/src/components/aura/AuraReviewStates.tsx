"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { AuraState } from "@/lib/aura/state";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
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

const MARK_STATES: AuraState[] = ["IDLE", "INPUT_ACTIVE", "THINKING", "RESPONSE_READY", "ERROR"];

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
        diagnosticsEnabled={false}
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
        diagnosticsEnabled={false}
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
        diagnosticsEnabled={false}
        onNavigate={() => {}}
        initialGuidedSection="services"
      />,
    ),
  },
  {
    id: "grounded",
    title: "Grounded answer — sources collapsed",
    note: "One quiet line. An answer should read as an answer.",
    frame: panel(
      "grounded",
      <AuraPanel
        id="review-3"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        diagnosticsEnabled={false}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "sources",
    title: "Sources expanded",
    note: "Title and section only. There is no field on the wire for a score, an id or a knowledge space, so none can appear here.",
    frame: panel(
      "sources",
      <AuraPanel
        id="review-4"
        onClose={() => {}}
        controller={stubController(GROUNDED)}
        diagnosticsEnabled={false}
        onNavigate={() => {}}
        expandSources
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
        diagnosticsEnabled={false}
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
        diagnosticsEnabled={false}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "boundary",
    title: "Internal boundary — no sources at all",
    note: "A boundary turn retrieves nothing, so there is nothing to cite and no Sources line appears.",
    frame: panel(
      "boundary",
      <AuraPanel
        id="review-7"
        onClose={() => {}}
        controller={stubController(BOUNDARY)}
        diagnosticsEnabled={false}
        onNavigate={() => {}}
      />,
    ),
  },
  {
    id: "diagnostics",
    title: "Developer diagnostics",
    note: "Off by default and never in a visitor build. Needs the frontend flag and the backend switch together, and shows routing outcomes only — no prompt, no scores, no identifiers.",
    frame: panel(
      "diagnostics",
      <AuraPanel
        id="review-8"
        onClose={() => {}}
        controller={stubController([
          GROUNDED[0]!,
          {
            ...GROUNDED[1]!,
            diagnostics: {
              mode: "GROUNDED_QA",
              evidenceLevel: "STRONG_EVIDENCE",
              language: "ENGLISH",
              tone: "CURIOUS",
              latencyMs: 1840,
            },
          },
        ])}
        diagnosticsEnabled
        onNavigate={() => {}}
      />,
    ),
  },
];

/** The phone the mobile sheet is reviewed at — iPhone 14/15 logical size. */
const PHONE = { width: 390, height: 844 };

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

  const only = query?.get("only") ?? null;
  const device = query?.get("device") ?? null;

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
            Add <code>?only=grounded</code> to see one state alone, filling the viewport, or{" "}
            <code>?device=mobile</code> to see every state at 390×844 — that page frames each one in
            its own viewport, so the mobile sheet is genuinely the mobile sheet rather than a
            narrowed desktop panel.
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
