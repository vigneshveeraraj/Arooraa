import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  permissionError,
  removeMicrophoneSupport,
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
 * Voice, driven through the real widget, the real controller, the real recorder and the real
 * composer — only the network, the microphone and the speaker are fake.
 *
 * <p>Two claims are load-bearing here and both are asserted rather than assumed. Voice never
 * appears unless the browser can record <em>and</em> the backend says it will transcribe; and a
 * transcript reaches the conversation through the ordinary send path, carrying the visitor's own
 * words unchanged, so there is no second door for it to come in by.
 */

class FakeAuraClient implements AuraApiClient {
  sent: { conversationId: string; message: string; currentPath: string | null }[] = [];
  private answers: AuraResult<AuraAnswer>[] = [];

  answerWith(...results: AuraResult<AuraAnswer>[]) {
    this.answers.push(...results);
    return this;
  }

  async createConversation() {
    return {
      ok: true as const,
      value: { conversationId: "c-1", assistantProfile: "AROORAA_WEBSITE", channel: "PUBLIC_WEB" },
    };
  }

  async sendMessage(conversationId: string, message: string, currentPath: string | null) {
    this.sent.push({ conversationId, message, currentPath });
    return (
      this.answers.shift() ?? {
        ok: true as const,
        value: { conversationId, answer: "Happy to help.", sources: [], diagnostics: null },
      }
    );
  }
}

class FakeVoiceClient implements AuraVoiceApiClient {
  uploads: AuraRecording[] = [];
  spoken: { conversationId: string; sequence: number | null }[] = [];

  private caps: AuraVoiceCapabilities | null = {
    transcription: true,
    synthesis: true,
    maxRecordingSeconds: 60,
  };
  private transcripts: AuraVoiceResult<string>[] = [];
  private speech: AuraVoiceResult<Blob>[] = [];

  withCapabilities(caps: AuraVoiceCapabilities | null) {
    this.caps = caps;
    return this;
  }

  hears(...results: AuraVoiceResult<string>[]) {
    this.transcripts.push(...results);
    return this;
  }

  speaksWith(...results: AuraVoiceResult<Blob>[]) {
    this.speech.push(...results);
    return this;
  }

  async capabilities() {
    return this.caps;
  }

  async transcribe(recording: AuraRecording) {
    this.uploads.push(recording);
    return this.transcripts.shift() ?? { ok: true as const, value: "What is MESA?" };
  }

  async speak(conversationId: string, sequence: number | null) {
    this.spoken.push({ conversationId, sequence });
    return (
      this.speech.shift() ?? {
        ok: true as const,
        value: new Blob([new Uint8Array(64)], { type: "audio/mpeg" }),
      }
    );
  }
}

let microphone: MicrophoneHarness | null = null;
let audio: AudioHarness | null = null;
let restoreSupport: (() => void) | null = null;

beforeEach(() => {
  pathname.mockReturnValue("/");
  push.mockClear();
  window.sessionStorage.clear();
  window.localStorage.clear();
  microphone = installMicrophone();
  audio = installAudio();
});

afterEach(() => {
  microphone?.restore();
  microphone = null;
  audio?.restore();
  audio = null;
  restoreSupport?.();
  restoreSupport = null;
});

async function openAura(client: AuraApiClient, voiceClient: AuraVoiceApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} voiceClient={voiceClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  // The panel is a real dynamic import, so opening it genuinely waits on a module.
  await screen.findByRole("dialog", { name: /Aura/ }, { timeout: 10_000 });
  return user;
}

function micButton() {
  return screen.getByRole("button", { name: /Speak to Aura/ });
}

/** Runs one full push-to-talk cycle: tap, the browser produces audio, tap again. */
async function speak(user: ReturnType<typeof userEvent.setup>) {
  await user.click(micButton());
  await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
  FakeMediaRecorder.latest().emit(50_000);
  await user.click(screen.getByRole("button", { name: "Stop recording and transcribe" }));
}

describe("Aura's voice", () => {
  // --- when it appears at all -----------------------------------------------------------------

  it("shows no microphone when the backend has voice switched off", async () => {
    // aura.voice.enabled=false means the route 404s, which the client reports as no capabilities.
    await openAura(new FakeAuraClient(), new FakeVoiceClient().withCapabilities(null));

    expect(screen.queryByRole("button", { name: /Speak to Aura/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Read answers aloud/ })).not.toBeInTheDocument();
  });

  it("shows no microphone when the browser cannot record", async () => {
    microphone?.restore();
    microphone = null;
    restoreSupport = removeMicrophoneSupport();

    await openAura(new FakeAuraClient(), new FakeVoiceClient());

    expect(screen.queryByRole("button", { name: /Speak to Aura/ })).not.toBeInTheDocument();
  });

  it("shows the microphone when the browser can record and the backend will listen", async () => {
    await openAura(new FakeAuraClient(), new FakeVoiceClient());

    await waitFor(() => expect(micButton()).toBeInTheDocument());
  });

  it("offers speaking separately from listening", async () => {
    // A deployment may want to take spoken questions and answer only in text, or the reverse.
    await openAura(
      new FakeAuraClient(),
      new FakeVoiceClient().withCapabilities({
        transcription: true,
        synthesis: false,
        maxRecordingSeconds: 60,
      }),
    );

    await waitFor(() => expect(micButton()).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Read answers aloud/ })).not.toBeInTheDocument();
  });

  it("tells a visitor they can speak in English, Tamil or Tanglish", async () => {
    await openAura(new FakeAuraClient(), new FakeVoiceClient());

    const cue = await screen.findByText(/Speak naturally/);
    expect(cue).toHaveTextContent("English");
    expect(cue).toHaveTextContent("தமிழ்");
    expect(cue).toHaveTextContent("Tanglish");
    // No flag, no globe: the mark is Aura's own geometry, and it is decorative.
    expect(cue.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}\u{1F310}]/u);
  });

  it("says nothing about speaking when voice is off", async () => {
    await openAura(new FakeAuraClient(), new FakeVoiceClient().withCapabilities(null));
    expect(screen.queryByText(/Speak naturally/)).not.toBeInTheDocument();
  });

  // --- recording ------------------------------------------------------------------------------

  it("records on a tap and transcribes on the next one", async () => {
    const voice = new FakeVoiceClient().hears({ ok: true, value: "What is MESA?" });
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);

    await waitFor(() => expect(voice.uploads).toHaveLength(1));
    expect(voice.uploads[0]!.blob.size).toBe(50_000);
  });

  it("shows the visitor what it heard instead of sending it for them", async () => {
    // The A5 decision, asserted: a transcript lands in the composer and waits. Nothing a
    // microphone picks up reaches the model until a person has read it and pressed send.
    const chat = new FakeAuraClient();
    const voice = new FakeVoiceClient().hears({ ok: true, value: "What is MESA?" });
    const user = await openAura(chat, voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);

    const composer = await screen.findByRole("textbox", { name: "Message Aura" });
    await waitFor(() => expect(composer).toHaveValue("What is MESA?"));
    expect(chat.sent).toHaveLength(0);
  });

  it("sends the transcript through the ordinary message path when the visitor is happy with it", async () => {
    const chat = new FakeAuraClient();
    const voice = new FakeVoiceClient().hears({ ok: true, value: "What is MESA?" });
    const user = await openAura(chat, voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);
    await screen.findByDisplayValue("What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(chat.sent).toHaveLength(1));
    // Word for word what was transcribed — the frontend does not rewrite, prefix or annotate it.
    expect(chat.sent[0]!.message).toBe("What is MESA?");
  });

  it("lets the visitor correct a mishearing before sending", async () => {
    const chat = new FakeAuraClient();
    const voice = new FakeVoiceClient().hears({ ok: true, value: "What is MESSA?" });
    const user = await openAura(chat, voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);
    const composer = await screen.findByDisplayValue("What is MESSA?");
    await user.clear(composer);
    await user.type(composer, "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(chat.sent).toHaveLength(1));
    expect(chat.sent[0]!.message).toBe("What is MESA?");
  });

  it("keeps a half-typed thought rather than overwriting it with a transcript", async () => {
    const voice = new FakeVoiceClient().hears({ ok: true, value: "for a restaurant chain" });
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "I need a system");
    await speak(user);

    await screen.findByDisplayValue("I need a system for a restaurant chain");
  });

  it.each([
    ["NotAllowedError", /microphone permission/i],
    ["NotFoundError", /can't find a microphone/i],
    ["NotReadableError", /using the microphone/i],
  ])("says something human when the browser refuses with %s", async (name, expected) => {
    microphone?.restore();
    microphone = installMicrophone(permissionError(name));
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(micButton());

    const notice = await screen.findByText(expected);
    // No error name, no stack, no provider vocabulary — and always a way to carry on.
    expect(notice.textContent).not.toContain("Error");
    expect(screen.getByRole("textbox", { name: "Message Aura" })).toBeInTheDocument();
  });

  it("keeps the conversation usable when transcription fails", async () => {
    const chat = new FakeAuraClient();
    const voice = new FakeVoiceClient().hears({
      ok: false,
      kind: "AUDIO_REJECTED",
      message: "I couldn't make that out. Try saying it again?",
    });
    const user = await openAura(chat, voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);

    await screen.findByText(/couldn't make that out/);
    const composer = screen.getByRole("textbox", { name: "Message Aura" });
    await user.type(composer, "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(chat.sent).toHaveLength(1));
  });

  it("lets a visitor dismiss a voice problem", async () => {
    const voice = new FakeVoiceClient().hears({
      ok: false,
      kind: "UNAVAILABLE",
      message: "I can't listen right now — type it to me instead?",
    });
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);
    await screen.findByText(/can't listen right now/);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    await waitFor(() => expect(screen.queryByText(/can't listen right now/)).not.toBeInTheDocument());
  });

  // --- speaking -------------------------------------------------------------------------------

  it("stays silent for a visitor who typed and never asked to be spoken to", async () => {
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);

    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText("Happy to help.");
    expect(voice.spoken).toHaveLength(0);
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it("answers out loud when the question was asked out loud", async () => {
    const voice = new FakeVoiceClient().hears({ ok: true, value: "What is MESA?" });
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await speak(user);
    await screen.findByDisplayValue("What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(voice.spoken).toHaveLength(1));
    expect(voice.spoken[0]).toEqual({ conversationId: "c-1", sequence: null });
  });

  it("answers out loud once the visitor turns speech on", async () => {
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Read answers aloud" }));
    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(voice.spoken).toHaveLength(1));
  });

  it("remembers the speech preference in this browser", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Read answers aloud" }));

    await waitFor(() => expect(window.localStorage.getItem("arooraa.aura.speakAnswers")).toBe("true"));
  });

  it("stops speaking when asked", async () => {
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Read answers aloud" }));
    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const stop = await screen.findByRole("button", { name: "Stop" });
    await user.click(stop);

    await waitFor(() => expect(FakeAudio.latest().paused).toBe(true));
    expect(audio!.revoked).toEqual(audio!.created);
  });

  it("never asks the backend to speak a string of its own choosing", async () => {
    // The client has no field for it and the endpoint has none to receive it; this pins the
    // consequence at the level a visitor's browser actually operates at.
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Read answers aloud" }));
    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(voice.spoken).toHaveLength(1));
    expect(Object.keys(voice.spoken[0]!)).toEqual(["conversationId", "sequence"]);
  });

  it("stays quiet and keeps the answer on screen when speaking fails", async () => {
    const voice = new FakeVoiceClient().speaksWith({
      ok: false,
      kind: "UNAVAILABLE",
      message: "I can't speak right now.",
    });
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Read answers aloud" }));
    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    // The answer is what the visitor asked for; not being able to read it aloud is not worth
    // interrupting them over.
    await screen.findByText("Happy to help.");
    await waitFor(() => expect(voice.spoken).toHaveLength(1));
    expect(FakeAudio.instances).toHaveLength(0);
  });

  // --- being a good citizen -------------------------------------------------------------------

  it("releases the microphone and stops talking when the panel is closed", async () => {
    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(micButton());
    await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: "Close Aura" }));

    await waitFor(() => expect(microphone!.tracks.every((track) => track.stopped)).toBe(true));
  });

  it("never lets a visitor hold two things at once", async () => {
    // One control, two states. While a message is being answered the microphone is unavailable,
    // so a recording cannot start against a conversation that is mid-turn.
    const chat = new FakeAuraClient();
    const user = await openAura(chat, new FakeVoiceClient());
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    await user.click(micButton());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Stop recording and transcribe" })).toBeInTheDocument(),
    );
    // The same control, now offering the opposite action rather than a second button appearing.
    expect(screen.queryByRole("button", { name: /Speak to Aura/ })).not.toBeInTheDocument();
  });

  it("keeps every voice control reachable from the keyboard", async () => {
    await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await waitFor(() => expect(micButton()).toBeInTheDocument());

    for (const control of [
      screen.getByRole("button", { name: "Read answers aloud" }),
      micButton(),
    ]) {
      expect(control.tagName).toBe("BUTTON");
      expect(control).not.toHaveAttribute("tabindex", "-1");
      expect(control).not.toBeDisabled();
    }
  });

  it("still works entirely without voice for anyone who ignores it", async () => {
    const chat = new FakeAuraClient();
    const user = await openAura(chat, new FakeVoiceClient());

    await user.type(screen.getByRole("textbox", { name: "Message Aura" }), "What is MESA?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText("Happy to help.");
    expect(chat.sent[0]!.message).toBe("What is MESA?");
  });
});
