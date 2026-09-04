import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
import type { AuraBrief, AuraBriefApiClient, AuraBriefResult } from "@/lib/aura/brief/brief-client";
import type { AuraRecording } from "@/lib/aura/voice/recorder";
import type {
  AuraVoiceApiClient,
  AuraVoiceCapabilities,
  AuraVoiceResult,
} from "@/lib/aura/voice/voice-client";
import {
  FakeAudio,
  FakeMediaRecorder,
  installAudio,
  installMicrophone,
  permissionError,
  type AudioHarness,
  type MicrophoneHarness,
} from "@/lib/aura/voice/test-support";
import { AuraWidget } from "./AuraWidget";

const pathname = vi.fn(() => "/");
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push }),
}));

/**
 * What "New" means (A5.2.2, owner finding 1).
 *
 * <p>The owner reported a voice transcript surviving a new conversation, a close and a reopen. The
 * cause was two pieces of state that had to agree kept at different lifetimes: the transcript
 * belongs to the voice controller, which lives above the lazy boundary and survives a close, while
 * the composer's memory of having already applied one dies with the composer. So a reopened panel
 * found a transcript still waiting and put it back in the box.
 *
 * <p>These tests are written against the whole widget rather than the reset function, because the
 * defect was never in a function — it was in what outlives what. Every one of them drives the real
 * controllers, the real panel and the real composer, and only the network, the microphone and the
 * speaker are fake.
 */

class FakeAuraClient implements AuraApiClient {
  createCalls = 0;
  sent: { conversationId: string; message: string; currentPath: string | null }[] = [];
  private answers: AuraResult<AuraAnswer>[] = [];
  private release: (() => void) | null = null;

  answerWith(...results: AuraResult<AuraAnswer>[]) {
    this.answers.push(...results);
    return this;
  }

  async createConversation() {
    this.createCalls += 1;
    return {
      ok: true as const,
      value: {
        conversationId: `c-${this.createCalls}`,
        assistantProfile: "AROORAA_WEBSITE",
        channel: "PUBLIC_WEB",
      },
    };
  }

  async sendMessage(conversationId: string, message: string, currentPath: string | null) {
    this.sent.push({ conversationId, message, currentPath });
    if (this.held) {
      await new Promise<void>((resolve) => {
        this.release = resolve;
      });
    }
    return (
      this.answers.shift() ?? {
        ok: true as const,
        value: { conversationId, sequence: 1, answer: "Happy to help.", sources: [], diagnostics: null },
      }
    );
  }

  held = false;
  releaseAnswer() {
    this.release?.();
    this.release = null;
  }
}

class FakeVoiceClient implements AuraVoiceApiClient {
  uploads: AuraRecording[] = [];
  held = false;
  private release: (() => void) | null = null;
  private caps: AuraVoiceCapabilities = { transcription: true, synthesis: true, maxRecordingSeconds: 60 };
  private transcripts: AuraVoiceResult<string>[] = [];

  hears(...results: AuraVoiceResult<string>[]) {
    this.transcripts.push(...results);
    return this;
  }

  async capabilities() {
    return this.caps;
  }

  async transcribe(recording: AuraRecording) {
    this.uploads.push(recording);
    if (this.held) {
      await new Promise<void>((resolve) => {
        this.release = resolve;
      });
    }
    return this.transcripts.shift() ?? { ok: true as const, value: "What is MESA?" };
  }

  releaseTranscript() {
    this.release?.();
    this.release = null;
  }

  async speak() {
    return { ok: true as const, value: new Blob([new Uint8Array(64)], { type: "audio/mpeg" }) };
  }
}

const READY_BRIEF: AuraBrief = {
  fields: { conversationSummary: "An app for parents to manage school schedules." },
  status: "DRAFT",
  readyToSummarise: true,
  handoffAvailable: true,
};

class FakeBriefClient implements AuraBriefApiClient {
  async peek(): Promise<AuraBriefResult<AuraBrief>> {
    return { ok: true, value: READY_BRIEF };
  }

  async summarise(): Promise<AuraBriefResult<AuraBrief>> {
    return { ok: true, value: READY_BRIEF };
  }

  async handOff() {
    return { ok: true as const, value: { enquiryReference: "ARO-2026-000001" } };
  }
}

let microphone: MicrophoneHarness | null = null;
let audio: AudioHarness | null = null;

beforeEach(() => {
  pathname.mockReturnValue("/");
  push.mockClear();
  window.sessionStorage.clear();
  window.localStorage.clear();
  microphone = installMicrophone();
  audio = installAudio();
});

afterEach(() => {
  // Unmounted first, with the fakes still installed, so React releases the microphone and revokes
  // its blob URLs against the fakes it took them from.
  cleanup();
  microphone?.restore();
  microphone = null;
  audio?.restore();
  audio = null;
});

async function openAura(client: AuraApiClient, voiceClient?: AuraVoiceApiClient, briefClient?: AuraBriefApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} voiceClient={voiceClient} briefClient={briefClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
  return user;
}

function composer() {
  return screen.getByRole("textbox", { name: "Message Aura" });
}

function newButton() {
  return screen.getByRole("button", { name: "New" });
}

/** One full push-to-talk cycle: tap, the browser produces audio, tap again. */
async function speak(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Start voice input" }));
  await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
  FakeMediaRecorder.latest().emit(50_000);
  await user.click(screen.getByRole("button", { name: /stop recording/i }));
}

/** Says one thing, which is what it takes for "New" to have something to do. */
async function saySomething(user: ReturnType<typeof userEvent.setup>, text = "Hi Aura") {
  await user.click(composer());
  await user.paste(text);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Happy to help.");
}

async function closeAndReopen(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Close Aura" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
}

describe("starting a new conversation", () => {
  // --- what the composer is holding -------------------------------------------------------------

  it("clears a typed draft the visitor never sent", async () => {
    const user = await openAura(new FakeAuraClient());
    await saySomething(user);

    await user.click(composer());
    await user.paste("something I was still thinking about");
    await user.click(newButton());

    expect(composer()).toHaveValue("");
  });

  it("clears a transcript the microphone put there", async () => {
    const voice = new FakeVoiceClient().hears({ ok: true, value: "Tell me about MESA" });
    const user = await openAura(new FakeAuraClient(), voice);
    await saySomething(user);

    await speak(user);
    await waitFor(() => expect(composer()).toHaveValue("Tell me about MESA"));
    await user.click(newButton());

    expect(composer()).toHaveValue("");
  });

  it("stays clear when Aura is closed and opened again — the owner's reproduction", async () => {
    // voice → transcript → New → close → reopen. The transcript used to be waiting in the voice
    // controller, which survives the close, for a freshly mounted composer with no memory of ever
    // having applied it.
    const voice = new FakeVoiceClient().hears({ ok: true, value: "Tell me about MESA" });
    const user = await openAura(new FakeAuraClient(), voice);
    await saySomething(user);

    await speak(user);
    await waitFor(() => expect(composer()).toHaveValue("Tell me about MESA"));
    await user.click(newButton());
    await closeAndReopen(user);

    expect(composer()).toHaveValue("");
    expect(screen.queryByText("Tell me about MESA")).not.toBeInTheDocument();
  });

  it("leaves none of the old conversation behind, and offers the guided menu again", async () => {
    const user = await openAura(new FakeAuraClient());
    await saySomething(user);

    await user.click(newButton());

    expect(screen.queryByText("Hi Aura")).not.toBeInTheDocument();
    expect(screen.queryByText("Happy to help.")).not.toBeInTheDocument();
    expect(screen.getByText("Hi — what would you like to explore?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    expect(composer()).toHaveValue("");
  });

  it("gives the next message a new conversation of its own", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);
    await saySomething(user);

    await user.click(newButton());
    expect(window.sessionStorage.getItem("arooraa.aura.conversationId")).toBeNull();

    await saySomething(user, "Hello again");

    expect(client.createCalls).toBe(2);
    expect(client.sent[0]?.conversationId).toBe("c-1");
    expect(client.sent[1]?.conversationId).toBe("c-2");
  });

  // --- what the browser is doing ----------------------------------------------------------------

  it("releases the microphone", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await saySomething(user);

    await user.click(await screen.findByRole("button", { name: "Start voice input" }));
    await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
    await user.click(newButton());

    // The browser's own recording indicator goes out with the conversation it belonged to.
    expect(microphone!.tracks.every((track) => track.stopped)).toBe(true);
    expect(screen.queryByText("Listening…")).not.toBeInTheDocument();
    expect(composer()).toBeInTheDocument();
  });

  it("stops Aura mid-sentence", async () => {
    const voice = new FakeVoiceClient().hears({ ok: true, value: "Tell me about MESA" });
    const user = await openAura(new FakeAuraClient(), voice);

    // A spoken question is answered aloud, so this reaches SPEAKING without touching a preference.
    await speak(user);
    await waitFor(() => expect(composer()).toHaveValue("Tell me about MESA"));
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(FakeAudio.instances.length).toBeGreaterThan(0));
    expect(FakeAudio.latest().paused).toBe(false);

    await user.click(newButton());

    expect(FakeAudio.latest().paused).toBe(true);
  });

  it("keeps the whole conversation when the panel is merely closed", async () => {
    // Closing is not starting again: the conversation survives it, and so does everything in it.
    const client = new FakeAuraClient();
    const user = await openAura(client);
    await saySomething(user);

    await closeAndReopen(user);

    expect(screen.getByText("Hi Aura")).toBeInTheDocument();
    expect(screen.getByText("Happy to help.")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("arooraa.aura.conversationId")).toBe("c-1");

    await user.click(composer());
    await user.paste("And another thing");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    // Same conversation, same backend id: closing Aura is not starting again.
    await waitFor(() => expect(client.sent).toHaveLength(2));
    expect(client.createCalls).toBe(1);
    expect(client.sent[1]?.conversationId).toBe("c-1");
  });

  // --- what is still in the air -----------------------------------------------------------------

  it("cannot be repopulated by a transcription that finishes afterwards", async () => {
    // The race the owner named. The recording was real and the words were really said — but they
    // were said to a conversation that no longer exists, so they go nowhere.
    const voice = new FakeVoiceClient().hears({ ok: true, value: "Tell me about MESA" });
    const user = await openAura(new FakeAuraClient(), voice);
    await saySomething(user);

    voice.held = true;
    await speak(user);
    await waitFor(() => expect(voice.uploads).toHaveLength(1));
    await screen.findByText("Understanding…");

    await user.click(newButton());
    voice.releaseTranscript();

    await waitFor(() => expect(composer()).toBeInTheDocument());
    // Given a hundred milliseconds to arrive, which it does not.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(composer()).toHaveValue("");
    expect(screen.queryByText("Tell me about MESA")).not.toBeInTheDocument();
  });

  it("cannot be filled in by an answer that finishes afterwards", async () => {
    const client = new FakeAuraClient();
    const user = await openAura(client);
    await saySomething(user);

    client.held = true;
    await user.click(composer());
    await user.paste("What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Thinking…");

    // Available mid-request on purpose: a visitor who has changed their mind should not have to
    // wait for an answer they no longer want.
    await user.click(newButton());
    client.answerWith({
      ok: true,
      value: {
        conversationId: "c-1",
        sequence: 2,
        answer: "MESA connects a restaurant.",
        sources: [],
        diagnostics: null,
      },
    });
    client.releaseAnswer();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByText("MESA connects a restaurant.")).not.toBeInTheDocument();
    expect(screen.queryByText("What is MESA?")).not.toBeInTheDocument();
    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
    expect(screen.getByText("Hi — what would you like to explore?")).toBeInTheDocument();
  });

  // --- what went wrong last time ----------------------------------------------------------------

  it("clears a failure and its offer to try again", async () => {
    const client = new FakeAuraClient().answerWith({
      ok: false,
      kind: "NETWORK",
      message: "I couldn't reach my knowledge just then.",
      retryable: true,
    });
    const user = await openAura(client);

    await user.click(composer());
    await user.paste("What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("I couldn't reach my knowledge just then.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    await user.click(newButton());

    expect(screen.queryByText("I couldn't reach my knowledge just then.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });

  it("clears a microphone that was refused", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await saySomething(user);

    microphone?.restore();
    microphone = installMicrophone(permissionError("NotAllowedError"));
    await user.click(await screen.findByRole("button", { name: "Start voice input" }));
    await screen.findByText(/Microphone access is needed/);

    await user.click(newButton());

    expect(screen.queryByText(/Microphone access is needed/)).not.toBeInTheDocument();
  });

  it("forgets a project brief that belonged to the conversation before it", async () => {
    const user = await openAura(new FakeAuraClient(), undefined, new FakeBriefClient());

    // Three turns is what it takes for the backend to be asked about a brief at all.
    for (const message of ["I have an app idea", "Parents and school schedules", "On their phones"]) {
      await user.click(composer());
      await user.paste(message);
      await user.click(screen.getByRole("button", { name: "Send message" }));
      await waitFor(() => expect(composer()).toHaveValue(""));
    }
    await screen.findByRole("button", { name: /Summarise what I've told you/ });

    await user.click(newButton());

    expect(screen.queryByRole("button", { name: /Summarise what I've told you/ })).not.toBeInTheDocument();
  });
});
