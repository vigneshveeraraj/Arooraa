import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
import type { AuraFeedbackClient, AuraFeedbackRating } from "@/lib/aura/feedback";
import type { AuraTranscriptMessage } from "@/lib/aura/types";
import { AuraPanel } from "./AuraPanel";
import { AuraWidget } from "./AuraWidget";

const pathname = vi.fn(() => "/");
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push }),
}));

/**
 * A7 from the browser's side: whether an answer was any use, asked once and quietly.
 *
 * <p>Most of this file is about restraint rather than about the vote. A control under every
 * message turns a conversation into a survey, so what is <em>not</em> on screen — under older
 * answers, under a failed one, while Aura is still thinking — is as much the design as the two
 * buttons are.
 */

class FakeAuraClient implements AuraApiClient {
  sequence = 1;
  failNext = false;

  async createConversation() {
    return {
      ok: true as const,
      value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
    };
  }

  async sendMessage(conversationId: string, message: string): Promise<AuraResult<AuraAnswer>> {
    if (this.failNext) {
      this.failNext = false;
      return {
        ok: false as const,
        kind: "NETWORK" as const,
        message: "I can't reach AROORAA from here right now.",
        retryable: true,
      };
    }
    this.sequence += 2;
    return {
      ok: true as const,
      value: {
        conversationId,
        sequence: this.sequence,
        answer: `Answer to "${message}".`,
        sources: [],
        diagnostics: null,
      },
    };
  }
}

/** An answer with no sequence — what an older backend, or a locally rendered turn, looks like. */
class UnnumberedAuraClient extends FakeAuraClient {
  override async sendMessage(conversationId: string, message: string): Promise<AuraResult<AuraAnswer>> {
    const result = await super.sendMessage(conversationId, message);
    return result.ok ? { ...result, value: { ...result.value, sequence: null } } : result;
  }
}

/** One answered turn, numbered — everything the control needs in order to appear. */
const ANSWERED_TURN: AuraTranscriptMessage = {
  id: "a1",
  role: "aura",
  text: "MESA connects the whole floor.",
  sequence: 3,
};

class RecordingFeedbackClient implements AuraFeedbackClient {
  readonly votes: { conversationId: string; sequence: number; rating: AuraFeedbackRating }[] = [];

  rate(conversationId: string, sequence: number, rating: AuraFeedbackRating) {
    this.votes.push({ conversationId, sequence, rating });
  }
}

async function openAura(client: AuraApiClient, feedbackClient: AuraFeedbackClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} feedbackClient={feedbackClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
  return user;
}

/** Pasted rather than typed: none of these tests is about what happens between keystrokes. */
async function ask(user: ReturnType<typeof userEvent.setup>, question: string) {
  const composer = screen.getByRole("textbox", { name: "Message Aura" });
  await user.click(composer);
  await user.paste(question);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(composer).toHaveValue(""));
  await screen.findByText(`Answer to "${question}".`);
}

describe("saying whether an answer was any use", () => {
  it("names the answer it is about, not just the conversation", async () => {
    // The whole point of the backend returning a sequence. Feedback that only named the
    // conversation would be unattributable the moment somebody asked a second question.
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new FakeAuraClient(), feedback);
    await ask(user, "What is MESA?");

    await user.click(await screen.findByRole("button", { name: "Yes" }));

    await waitFor(() => expect(feedback.votes).toHaveLength(1));
    expect(feedback.votes[0]).toEqual({ conversationId: "c-1", sequence: 3, rating: "HELPFUL" });
  });

  it("records a no exactly as readily as a yes", async () => {
    // No confirmation step, no "are you sure", no box to type a reason first. A visitor who taps
    // "no" has already given us the fact worth having.
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new FakeAuraClient(), feedback);
    await ask(user, "What is MESA?");

    await user.click(await screen.findByRole("button", { name: "No" }));

    await waitFor(() => expect(feedback.votes).toHaveLength(1));
    expect(feedback.votes[0]?.rating).toBe("NOT_HELPFUL");
    expect(screen.queryByRole("textbox", { name: /why/i })).not.toBeInTheDocument();
  });

  it("says thank you instead of leaving the buttons there", async () => {
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new FakeAuraClient(), feedback);
    await ask(user, "What is MESA?");

    await user.click(await screen.findByRole("button", { name: "Yes" }));

    await screen.findByText("Glad that helped.");
    expect(screen.queryByRole("button", { name: "Yes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "No" })).not.toBeInTheDocument();
  });

  it("cannot be voted on twice", async () => {
    // Follows from the control replacing itself, and worth pinning: a second tap would be a
    // second row about one answer, and the counts are the entire value of this table.
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new FakeAuraClient(), feedback);
    await ask(user, "What is MESA?");

    const yes = await screen.findByRole("button", { name: "Yes" });
    await user.click(yes);
    await screen.findByText("Glad that helped.");

    expect(feedback.votes).toHaveLength(1);
  });

  it("asks under the latest answer and nowhere else", async () => {
    // Under every message it would be a survey. Asked once, about the thing just said, it is a
    // question — and the previous one has expired, because the visitor moved on.
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new FakeAuraClient(), feedback);
    await ask(user, "What is MESA?");
    expect(await screen.findAllByText("Was that useful?")).toHaveLength(1);

    await ask(user, "What does it cover?");

    expect(await screen.findAllByText("Was that useful?")).toHaveLength(1);
  });

  it("does not ask about an answer that never arrived", async () => {
    const client = new FakeAuraClient();
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(client, feedback);

    client.failNext = true;
    await user.click(screen.getByRole("textbox", { name: "Message Aura" }));
    await user.paste("What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText("I can't reach AROORAA from here right now.");
    expect(screen.queryByText("Was that useful?")).not.toBeInTheDocument();
    expect(feedback.votes).toHaveLength(0);
  });

  it("does not ask about an answer it cannot name", async () => {
    // A turn with no sequence cannot be attributed, so it is not offered — rather than sending a
    // vote about whichever turn the backend guesses.
    const feedback = new RecordingFeedbackClient();
    const user = await openAura(new UnnumberedAuraClient(), feedback);
    await ask(user, "What is MESA?");

    expect(screen.queryByText("Was that useful?")).not.toBeInTheDocument();
  });

  it("is absent entirely from a panel with nowhere to send it", () => {
    // Like everything Aura has gained since A4, it is additive: a panel given no onRate is
    // exactly the panel before this milestone, rather than one showing a control that does
    // nothing.
    render(
      <AuraPanel
        id="feedback-absent"
        onClose={() => {}}
        controller={{
          transcript: [ANSWERED_TURN],
          state: "IDLE",
          failure: null,
          busy: false,
          conversationId: "c-1",
          send: () => {},
          retryLast: () => {},
          startNewConversation: () => {},
          markInputActive: () => {},
        }}
        onNavigate={() => {}}
      />,
    );

    expect(screen.getByText("MESA connects the whole floor.")).toBeInTheDocument();
    expect(screen.queryByText("Was that useful?")).not.toBeInTheDocument();
  });

  it("keeps the conversation usable when recording the vote fails", async () => {
    // Fire and forget, on purpose. A visitor who was kind enough to answer must never be shown an
    // error about our analytics, and must never be blocked by one.
    const exploding: AuraFeedbackClient = {
      rate() {
        throw new Error("network down");
      },
    };
    const user = await openAura(new FakeAuraClient(), exploding);
    await ask(user, "What is MESA?");

    await user.click(await screen.findByRole("button", { name: "Yes" }));

    await screen.findByText("Glad that helped.");
    await ask(user, "What does it cover?");
  });
});
