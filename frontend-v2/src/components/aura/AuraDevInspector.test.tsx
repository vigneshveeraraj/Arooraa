import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraConversationController } from "@/lib/aura/useAuraConversation";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
import { stubAuraVoice } from "@/lib/aura/voice/stub-controller";
import { AuraDevInspector } from "./AuraDevInspector";
import { AuraPanel } from "./AuraPanel";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));

const GROUNDED_TURN: AuraTranscriptMessage = {
  id: "a1",
  role: "aura",
  text: "MESA is AROORAA's connected restaurant technology ecosystem.",
  sources: [
    {
      title: "MESA — Restaurant Technology Ecosystem",
      section: "What MESA does today",
      sourceUrl: "https://arooraa.com/products/mesa",
    },
    { title: "AROORAA — Company Overview", section: null, sourceUrl: null },
  ],
  diagnostics: {
    mode: "GROUNDED_QA",
    evidenceLevel: "STRONG_EVIDENCE",
    language: "ENGLISH",
    tone: "NEUTRAL",
    latencyMs: 3739,
  },
};

function controller(transcript: AuraTranscriptMessage[]): AuraConversationController {
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
  };
}

describe("the developer inspector", () => {
  it("shows the latest turn's routing metadata and citations", () => {
    render(<AuraDevInspector turn={GROUNDED_TURN} />);

    expect(screen.getByText("GROUNDED_QA")).toBeInTheDocument();
    expect(screen.getByText("STRONG_EVIDENCE")).toBeInTheDocument();
    expect(screen.getByText("ENGLISH")).toBeInTheDocument();
    expect(screen.getByText("NEUTRAL")).toBeInTheDocument();
    expect(screen.getByText("3739ms")).toBeInTheDocument();
    expect(screen.getByText("MESA — Restaurant Technology Ecosystem")).toBeInTheDocument();
  });

  it("collapses by default, so it never competes with the conversation", async () => {
    const user = userEvent.setup();
    const { container } = render(<AuraDevInspector turn={GROUNDED_TURN} />);

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");

    await user.click(screen.getByText("Dev"));
    expect(details).toHaveAttribute("open");
  });

  it("links a citation only when the URL is genuinely http(s)", () => {
    render(
      <AuraDevInspector
        turn={{
          ...GROUNDED_TURN,
          sources: [
            { title: "Safe", section: null, sourceUrl: "https://arooraa.com/x" },
            { title: "Unsafe", section: null, sourceUrl: "javascript:alert(1)" },
            { title: "Provenance path", section: null, sourceUrl: "frontend-v2/src/lib/content/products.ts" },
          ],
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Safe" })).toHaveAttribute("href", "https://arooraa.com/x");
    expect(screen.queryByRole("link", { name: "Unsafe" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Provenance path" })).not.toBeInTheDocument();
  });

  it("renders nothing at all when there is nothing to inspect", () => {
    const { container } = render(<AuraDevInspector turn={null} />);
    expect(container).toBeEmptyDOMElement();

    const { container: noMetadata } = render(
      <AuraDevInspector turn={{ id: "a", role: "aura", text: "Hello." }} />,
    );
    expect(noMetadata).toBeEmptyDOMElement();
  });

  it("appears in the panel only when the panel is told to show it", async () => {
    const transcript = [
      { id: "u1", role: "user" as const, text: "What is MESA?" },
      GROUNDED_TURN,
    ];

    const { unmount } = render(
      <AuraPanel id="p1" onClose={() => {}} controller={controller(transcript)} onNavigate={() => {}} />,
    );
    expect(screen.queryByText("Dev")).not.toBeInTheDocument();
    unmount();

    render(
      <AuraPanel
        id="p2"
        onClose={() => {}}
        controller={controller(transcript)}
        onNavigate={() => {}}
        devDiagnostics
      />,
    );
    // A real dynamic import: the inspector lives in its own chunk so a public page never fetches
    // it, which means even here it arrives a tick later than the panel around it.
    const summary = await screen.findByText("Dev", {}, { timeout: 10_000 });

    const user = userEvent.setup();
    await user.click(summary);
    expect(screen.getByText("GROUNDED_QA")).toBeInTheDocument();
  });

  it("describes the latest Aura turn, not every turn", async () => {
    render(
      <AuraPanel
        id="p3"
        onClose={() => {}}
        controller={controller([
          { id: "u1", role: "user", text: "What is MESA?" },
          { ...GROUNDED_TURN, id: "a1" },
          { id: "u2", role: "user", text: "Hi Aura" },
          {
            id: "a2",
            role: "aura",
            text: "Hello!",
            sources: [],
            diagnostics: { mode: "SOCIAL", evidenceLevel: "NO_EVIDENCE" },
          },
        ])}
        onNavigate={() => {}}
        devDiagnostics
      />,
    );

    // One inspector, describing the most recent answer.
    await screen.findByText("Dev", {}, { timeout: 10_000 });
    expect(screen.getAllByText("Dev")).toHaveLength(1);
    expect(screen.getByText("SOCIAL")).toBeInTheDocument();
    expect(screen.queryByText("GROUNDED_QA")).not.toBeInTheDocument();
  });

  it("times each stage of a voice turn separately", async () => {
    // "Voice feels slow" has four possible causes, and one total number tells you which of them it
    // was in none of the cases. Measured in the browser because the number that matters —
    // microphone released to first audible word — spans three requests.
    render(
      <AuraPanel
        id="aura-panel"
        onClose={() => {}}
        controller={controller([{ id: "a1", role: "aura", text: "MESA connects the floor." }])}
        onNavigate={() => {}}
        devDiagnostics
        devDiagnosticsOpen
        voice={stubAuraVoice({
          timings: { recordingMs: 3142, transcriptionMs: 880, synthesisMs: 640, turnMs: 2100 },
        })}
      />,
    );

    await screen.findByText("Dev", {}, { timeout: 10_000 });
    expect(screen.getByText("3142ms")).toBeInTheDocument();
    expect(screen.getByText("880ms")).toBeInTheDocument();
    expect(screen.getByText("640ms")).toBeInTheDocument();
    expect(screen.getByText("2100ms")).toBeInTheDocument();
  });

  it("shows no timings for a conversation nobody spoke in", async () => {
    render(
      <AuraPanel
        id="aura-panel"
        onClose={() => {}}
        controller={controller([
          {
            id: "a1",
            role: "aura",
            text: "MESA connects the floor.",
            diagnostics: { mode: "GROUNDED_QA" },
          },
        ])}
        onNavigate={() => {}}
        devDiagnostics
        devDiagnosticsOpen
        voice={stubAuraVoice()}
      />,
    );

    await screen.findByText("Dev", {}, { timeout: 10_000 });
    expect(screen.queryByText("transcribe")).not.toBeInTheDocument();
    expect(screen.queryByText("voice turn")).not.toBeInTheDocument();
  });
});
