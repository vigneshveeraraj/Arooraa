import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
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
 * A5.1 — the parts of voice that are about how it feels rather than whether it works: stopping
 * Aura mid-sentence, knowing how much recording time is left, hearing an answer again, and not
 * leaving a microphone open when a visitor's attention goes elsewhere.
 */

class FakeAuraClient implements AuraApiClient {
  sent: string[] = [];

  async createConversation() {
    return {
      ok: true as const,
      value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
    };
  }

  async sendMessage(conversationId: string, message: string): Promise<AuraResult<AuraAnswer>> {
    this.sent.push(message);
    return {
      ok: true as const,
      value: { conversationId, sequence: 1, answer: "MESA connects the whole floor.", sources: [], diagnostics: null },
    };
  }
}

class FakeVoiceClient implements AuraVoiceApiClient {
  spoken: { conversationId: string; sequence: number | null }[] = [];
  uploads: AuraRecording[] = [];
  private caps: AuraVoiceCapabilities = {
    transcription: true,
    synthesis: true,
    maxRecordingSeconds: 60,
  };

  withRecordingCeiling(seconds: number) {
    this.caps = { ...this.caps, maxRecordingSeconds: seconds };
    return this;
  }

  async capabilities() {
    return this.caps;
  }

  async transcribe(recording: AuraRecording): Promise<AuraVoiceResult<string>> {
    this.uploads.push(recording);
    return { ok: true, value: "What is MESA?" };
  }

  async speak(conversationId: string, sequence: number | null): Promise<AuraVoiceResult<Blob>> {
    this.spoken.push({ conversationId, sequence });
    return { ok: true, value: new Blob([new Uint8Array(64)], { type: "audio/mpeg" }) };
  }
}

let microphone: MicrophoneHarness | null = null;
let audio: AudioHarness | null = null;

beforeEach(() => {
  pathname.mockReturnValue("/");
  window.sessionStorage.clear();
  window.localStorage.clear();
  microphone = installMicrophone();
  audio = installAudio();
});

/** Set by the tests that background the tab; restored here so the next test never inherits it. */
function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

afterEach(() => {
  // Unmount first, with the fakes still installed. React tears the widget down here — releasing
  // the microphone, disposing the speaker, revoking blob URLs — and if the fakes have already
  // been restored it does all of that against the real jsdom APIs, which leaves the next test
  // rendering into a broken environment.
  cleanup();
  microphone?.restore();
  microphone = null;
  audio?.restore();
  audio = null;
  // Dispatched, not just assigned. React's scheduler learns the page is hidden from the event and
  // then defers work; setting the property back without telling anyone leaves it deferring, and
  // the next test renders a widget whose state updates never flush.
  setVisibility("visible");
});

async function openAura(client: AuraApiClient, voiceClient: AuraVoiceApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} voiceClient={voiceClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
  await screen.findByRole("button", { name: "Start voice input" });
  return user;
}

/** Turns speech on and asks a question by typing, so Aura reads the answer aloud. */
async function askAndBeSpokenTo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Read answers aloud" }));
  await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await waitFor(() => expect(FakeAudio.instances.length).toBe(1));
}

describe("Aura's voice, in use", () => {
  // --- interruption ---------------------------------------------------------------------------

  it("stops talking the moment the visitor reaches for the microphone", async () => {
    // Local playback interruption, which is what tapping the microphone mid-sentence means. Not
    // barge-in against a model that is still generating — that is a different architecture and a
    // later decision.
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await askAndBeSpokenTo(user);

    const utterance = FakeAudio.latest();
    expect(utterance.paused).toBe(false);

    await user.click(screen.getByRole("button", { name: "Start voice input" }));

    expect(utterance.paused).toBe(true);
    expect(audio!.revoked).toContain(audio!.created[0]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /stop recording/i })).toBeInTheDocument(),
    );
  });

  it("stops talking when the visitor asks it to and leaves the answer on screen", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await askAndBeSpokenTo(user);

    await user.click(await screen.findByRole("button", { name: "Stop" }));

    expect(FakeAudio.latest().paused).toBe(true);
    expect(screen.getByText("MESA connects the whole floor.")).toBeInTheDocument();
  });

  it("stops talking when speech is switched off mid-sentence", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await askAndBeSpokenTo(user);

    await user.click(screen.getByRole("button", { name: "Stop reading answers aloud" }));

    expect(FakeAudio.latest().paused).toBe(true);
  });

  // --- hearing it again -----------------------------------------------------------------------

  it("offers to say it again once, for the turn it just read", async () => {
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await askAndBeSpokenTo(user);

    // While it is still talking, the offer is to stop — not to start again.
    expect(screen.queryByRole("button", { name: "Play again" })).not.toBeInTheDocument();
    FakeAudio.latest().end();

    await user.click(await screen.findByRole("button", { name: "Play again" }));
    await waitFor(() => expect(voice.spoken).toHaveLength(2));
    // Still by conversation, still no text — a replay is the same request as the first one.
    expect(voice.spoken[1]).toEqual({ conversationId: "c-1", sequence: null });
  });

  it("withdraws the offer as soon as the visitor starts speaking again", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await askAndBeSpokenTo(user);
    FakeAudio.latest().end();
    await screen.findByRole("button", { name: "Play again" });

    await user.click(screen.getByRole("button", { name: "Start voice input" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Play again" })).not.toBeInTheDocument(),
    );
  });

  it("offers nothing to replay when nothing was read aloud", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());

    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText("MESA connects the whole floor.");
    expect(screen.queryByRole("button", { name: "Play again" })).not.toBeInTheDocument();
  });

  // --- recording lifecycle --------------------------------------------------------------------

  it("says nothing about the ceiling until it is close", async () => {
    // The elapsed clock runs from the first word; the countdown does not. A5.2 added the first
    // because the owner could not tell whether Aura was listening, and kept the second late
    // because a countdown from the start makes an ordinary question feel timed.
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient().withRecordingCeiling(60));

    await user.click(screen.getByRole("button", { name: "Start voice input" }));

    await screen.findByText("Listening…");
    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.queryByText(/\ds left/)).not.toBeInTheDocument();
  });

  it("counts down once the ceiling is close, so stopping is never a surprise", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient().withRecordingCeiling(10));

    await user.click(screen.getByRole("button", { name: "Start voice input" }));

    await screen.findByText(/\ds left/, undefined, { timeout: 4_000 });
  });

  it("finishes the recording rather than losing it when the visitor looks away", async () => {
    // A backgrounded tab is not someone who has finished speaking, but browsers are free to
    // suspend a stream they think nobody is watching. Whatever was already said survives and
    // arrives in the composer for them to find.
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);

    await user.click(screen.getByRole("button", { name: "Start voice input" }));
    await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
    FakeMediaRecorder.latest().emit(50_000);

    setVisibility("hidden");

    await waitFor(() => expect(voice.uploads).toHaveLength(1));
    await screen.findByDisplayValue("What is MESA?");
    expect(microphone!.tracks.every((track) => track.stopped)).toBe(true);

    // Restored while the widget is still mounted, so it — and React — see the page come back.
    setVisibility("visible");
  });

  it("does not start a recording just because a tab was backgrounded", async () => {
    // The listener lives in the widget rather than the panel, so this deliberately does not open
    // Aura at all: backgrounding a tab must be inert whether or not anybody is looking at it.
    const voice = new FakeVoiceClient();
    render(<AuraWidget client={new FakeAuraClient()} voiceClient={voice} />);
    await screen.findByRole("button", { name: "Ask Aura" });

    setVisibility("hidden");

    expect(FakeMediaRecorder.instances).toHaveLength(0);
    expect(voice.uploads).toHaveLength(0);
  });
});
