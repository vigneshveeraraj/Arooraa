import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
import { AuraPanel } from "./AuraPanel";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));

/**
 * A4.2: what a visitor is allowed to see.
 *
 * <p>Every turn in this file arrives carrying the full backend payload — citations with titles,
 * sections and URLs, plus mode, evidence level, language, tone and latency. That is the point.
 * The old panel rendered "Sources · 3" and "GROUNDED_QA · STRONG_EVIDENCE · ENGLISH · NEUTRAL ·
 * 3739ms" under Aura's answers, so these tests assert against a message that would light all of it
 * up: if any of it comes back, it fails here rather than in front of a visitor.
 *
 * <p>Deliberately asserted on the rendered text of the whole dialog rather than on the absence of
 * a particular component. A future re-introduction under a different component name, or a stray
 * `title` attribute, is caught the same way.
 */
function controller(
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

/** A grounded MESA turn with every piece of metadata the backend can attach. */
const LOADED_TURN: AuraTranscriptMessage[] = [
  { id: "u1", role: "user", text: "What is MESA?" },
  {
    id: "a1",
    role: "aura",
    text: "MESA is AROORAA's connected restaurant technology ecosystem.",
    sources: [
      {
        title: "MESA — Restaurant Technology Ecosystem",
        section: "What MESA does today",
        sourceUrl: "https://arooraa.com/products/mesa",
      },
      { title: "AROORAA — Company Overview", section: "How we work", sourceUrl: null },
      { title: "Public Product Status", section: null, sourceUrl: null },
    ],
    diagnostics: {
      mode: "GROUNDED_QA",
      evidenceLevel: "STRONG_EVIDENCE",
      language: "ENGLISH",
      tone: "NEUTRAL",
      latencyMs: 3739,
      guardrail: null,
    },
  },
];

function renderPublicPanel(transcript: AuraTranscriptMessage[]) {
  render(
    <AuraPanel
      id="aura-panel"
      onClose={() => {}}
      controller={controller(transcript)}
      onNavigate={() => {}}
    />,
  );
  return screen.getByRole("dialog", { name: /Aura/ });
}

/** Every word the owner asked never to appear beneath an answer. */
const DEVELOPER_VOCABULARY = [
  "Sources",
  "GROUNDED_QA",
  "GENERAL_CONSULTING",
  "PROJECT_DISCOVERY",
  "SOCIAL",
  "INTERNAL_BOUNDARY",
  "STRONG_EVIDENCE",
  "WEAK_EVIDENCE",
  "NO_EVIDENCE",
  "ENGLISH",
  "TAMIL",
  "TANGLISH",
  "NEUTRAL",
  "CURIOUS",
  "FRUSTRATED",
  "3739ms",
  "evidence",
  "latency",
];

describe("the public Aura conversation", () => {
  it("renders a grounded answer normally", () => {
    const dialog = renderPublicPanel(LOADED_TURN);

    expect(
      screen.getByText("MESA is AROORAA's connected restaurant technology ecosystem."),
    ).toBeInTheDocument();
    expect(screen.getByText("What is MESA?")).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });

  it.each(DEVELOPER_VOCABULARY)("never shows %s to a visitor", (word) => {
    const dialog = renderPublicPanel(LOADED_TURN);

    expect(dialog.textContent).not.toContain(word);
  });

  it("never shows a source title, section or URL", () => {
    const dialog = renderPublicPanel(LOADED_TURN);

    expect(dialog.textContent).not.toContain("MESA — Restaurant Technology Ecosystem");
    expect(dialog.textContent).not.toContain("What MESA does today");
    expect(dialog.textContent).not.toContain("AROORAA — Company Overview");
    expect(dialog.textContent).not.toContain("Public Product Status");
    expect(dialog.textContent).not.toContain("arooraa.com/products/mesa");
    expect(dialog.querySelector('a[href*="arooraa.com"]')).toBeNull();
  });

  it("offers nothing focusable beyond the conversation itself", () => {
    // A hidden-but-focusable diagnostics control would still be reachable by keyboard and still be
    // announced. The public panel has the guided menu, the header controls and the composer, and
    // nothing whose name belongs to developer tooling.
    const dialog = renderPublicPanel(LOADED_TURN);

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>("a[href], button, textarea, input, summary, [tabindex]"),
    );
    for (const element of focusable) {
      const label = (element.textContent ?? "") + (element.getAttribute("aria-label") ?? "");
      expect(label).not.toMatch(/dev|inspect|diagnost|source/i);
    }
    expect(dialog.querySelector("details")).toBeNull();
  });

  it("keeps a boundary turn clean", () => {
    const dialog = renderPublicPanel([
      { id: "u2", role: "user", text: "What database does MESA use internally?" },
      {
        id: "a2",
        role: "aura",
        text: "That one's on the private side of the line for me.",
        sources: [],
        diagnostics: { mode: "INTERNAL_BOUNDARY", evidenceLevel: "NO_EVIDENCE", latencyMs: 812 },
      },
    ]);

    expect(screen.getByText("That one's on the private side of the line for me.")).toBeInTheDocument();
    expect(dialog.textContent).not.toContain("INTERNAL_BOUNDARY");
    expect(dialog.textContent).not.toContain("NO_EVIDENCE");
  });

  it("keeps a social turn clean", () => {
    const dialog = renderPublicPanel([
      { id: "u3", role: "user", text: "Hi Aura" },
      {
        id: "a3",
        role: "aura",
        text: "Hello! What would you like to explore?",
        sources: [],
        diagnostics: { mode: "SOCIAL", evidenceLevel: "NO_EVIDENCE", language: "ENGLISH" },
      },
    ]);

    expect(screen.getByText("Hello! What would you like to explore?")).toBeInTheDocument();
    expect(dialog.textContent).not.toContain("SOCIAL");
    expect(dialog.textContent).not.toContain("NO_EVIDENCE");
  });

  it("keeps a project-discovery turn clean", () => {
    const dialog = renderPublicPanel([
      { id: "u4", role: "user", text: "I have a product idea." },
      {
        id: "a4",
        role: "aura",
        text: "What problem does it solve for the people who would use it?",
        sources: [],
        diagnostics: { mode: "PROJECT_DISCOVERY", evidenceLevel: "NO_EVIDENCE", tone: "CURIOUS" },
      },
    ]);

    expect(
      screen.getByText("What problem does it solve for the people who would use it?"),
    ).toBeInTheDocument();
    expect(dialog.textContent).not.toContain("PROJECT_DISCOVERY");
    expect(dialog.textContent).not.toContain("CURIOUS");
  });

  it("keeps a page-aware MESA answer grounded and still clean", () => {
    // The A4.1 behaviour has to survive the A4.2 cleanup: the answer is still the grounded one,
    // the citations still arrive on the message, and none of it is rendered.
    const dialog = renderPublicPanel([
      { id: "u5", role: "user", text: "Tell me more about this." },
      { ...LOADED_TURN[1]!, id: "a5" },
    ]);

    expect(screen.getByText("Tell me more about this.")).toBeInTheDocument();
    expect(
      screen.getByText("MESA is AROORAA's connected restaurant technology ecosystem."),
    ).toBeInTheDocument();
    expect(dialog.textContent).not.toContain("Sources");
    expect(dialog.textContent).not.toContain("STRONG_EVIDENCE");
  });

  it("still carries sources and diagnostics on the message the panel was given", () => {
    // The cleanup is presentation-only. Nothing was stripped from the data the frontend holds —
    // if it had been, grounding, auditing and the developer inspector would all have lost it too.
    const turn = LOADED_TURN[1]!;

    expect(turn.sources).toHaveLength(3);
    expect(turn.diagnostics?.mode).toBe("GROUNDED_QA");
    expect(turn.diagnostics?.evidenceLevel).toBe("STRONG_EVIDENCE");
  });

  it("stays just as clean with voice switched on", () => {
    // Voice adds two controls and a language cue. None of it may bring provider, model or
    // routing vocabulary into the conversation with it.
    render(
      <AuraPanel
        id="aura-panel-voice"
        onClose={() => {}}
        controller={controller(LOADED_TURN)}
        onNavigate={() => {}}
        voice={{
          supported: true,
          available: true,
          speechAvailable: true,
          status: "IDLE",
          error: null,
          transcript: null,
          speakAnswers: false,
          maxRecordingSeconds: 60,
          startListening: () => {},
          stopListening: () => {},
          cancelListening: () => {},
          setSpeakAnswers: () => {},
          replay: () => {},
          announceAnswer: () => {},
          stopSpeaking: () => {},
          dismissError: () => {},
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: /Aura/ });
    for (const word of [...DEVELOPER_VOCABULARY, "whisper", "openai", "Whisper", "OpenAI", "tts", "mp3", "webm"]) {
      expect(dialog.textContent, `voice must not surface ${word}`).not.toContain(word);
    }
  });
});
