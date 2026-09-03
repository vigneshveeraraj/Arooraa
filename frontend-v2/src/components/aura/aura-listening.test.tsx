import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuraApiClient } from "@/lib/aura/client";
import type { AuraAnswer, AuraResult } from "@/lib/aura/types";
import type { AuraRecording } from "@/lib/aura/voice/recorder";
import type { AuraVoiceApiClient, AuraVoiceResult } from "@/lib/aura/voice/voice-client";
import {
  FakeMediaRecorder,
  installAudio,
  installMicrophone,
  permissionError,
  type AudioHarness,
  type MicrophoneHarness,
} from "@/lib/aura/voice/test-support";
import { AuraListening } from "./AuraListening";
import { AuraWidget } from "./AuraWidget";

const pathname = vi.fn(() => "/");
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ push }),
}));

/**
 * A5.2 owner findings 2 and 3: the language row that sat in the panel permanently, and a recording
 * state the owner could not tell apart from an idle one.
 *
 * <p>Two halves. The first renders the recording stage on its own, because what it shows for a
 * given state is a question with an exact answer and does not need a microphone to ask. The second
 * drives the real widget, the real controller and the real recorder — only the network and the
 * microphone are fake — because the claims that matter are about sequences: what a first-time
 * visitor sees and a returning one does not, and what happens to an open microphone when somebody
 * changes their mind.
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
      value: { conversationId, sequence: 1, answer: "MESA connects the floor.", sources: [], diagnostics: null },
    };
  }
}

class FakeVoiceClient implements AuraVoiceApiClient {
  uploads: AuraRecording[] = [];
  /** Set to hold transcription open, so the "Understanding…" state can be observed. */
  private pending: ((result: AuraVoiceResult<string>) => void) | null = null;
  private holdOpen = false;

  holdsTranscription() {
    this.holdOpen = true;
    return this;
  }

  finishTranscription(text: string) {
    this.pending?.({ ok: true, value: text });
    this.pending = null;
  }

  async capabilities() {
    return { transcription: true, synthesis: true, maxRecordingSeconds: 60 };
  }

  transcribe(recording: AuraRecording): Promise<AuraVoiceResult<string>> {
    this.uploads.push(recording);
    if (!this.holdOpen) return Promise.resolve({ ok: true, value: "Tell me about MESA" });
    return new Promise((resolve) => {
      this.pending = resolve;
    });
  }

  async speak(): Promise<AuraVoiceResult<Blob>> {
    return { ok: true, value: new Blob([new Uint8Array(8)], { type: "audio/mpeg" }) };
  }
}

let microphone: MicrophoneHarness | null = null;
// A question asked out loud is answered out loud, so a full push-to-talk cycle reaches the
// speaker. jsdom has an Audio element with no media stack behind it, and an unhandled rejection
// from play() would surface as a false positive somewhere else entirely.
let audio: AudioHarness | null = null;

beforeEach(() => {
  pathname.mockReturnValue("/");
  window.sessionStorage.clear();
  window.localStorage.clear();
  microphone = installMicrophone();
  audio = installAudio();
});

afterEach(() => {
  // Unmount with the fakes still installed, so React's teardown releases the microphone against
  // the fake rather than against jsdom's own missing one.
  cleanup();
  microphone?.restore();
  microphone = null;
  audio?.restore();
  audio = null;
  vi.restoreAllMocks();
});

async function openAura(client: AuraApiClient, voiceClient: AuraVoiceApiClient) {
  const user = userEvent.setup();
  render(<AuraWidget client={client} voiceClient={voiceClient} />);
  await user.click(screen.getByRole("button", { name: "Ask Aura" }));
  await screen.findByRole("dialog", { name: /Aura/ });
  await screen.findByRole("button", { name: "Start voice input" });
  return user;
}

async function startRecording(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Start voice input" }));
  await waitFor(() => expect(FakeMediaRecorder.instances.length).toBeGreaterThan(0));
  await screen.findByText("Listening…");
}

/** One full push-to-talk cycle: start, the browser produces audio, Done. */
async function speak(user: ReturnType<typeof userEvent.setup>) {
  await startRecording(user);
  FakeMediaRecorder.latest().emit(50_000);
  await user.click(screen.getByRole("button", { name: /stop recording/i }));
}

function meter() {
  return document.querySelector('[data-meter="level"]');
}

describe("the recording stage", () => {
  const props = {
    introducing: false,
    elapsedSeconds: 0,
    secondsLeft: null,
    onDone: () => {},
    onCancel: () => {},
  };

  it("says what it is doing in words, not only in colour", () => {
    // The owner's finding: a tinted 44px button is a state badge, and what a person needs at that
    // moment is evidence. Each state says so outright.
    const { rerender } = render(<AuraListening {...props} status="REQUESTING" />);
    expect(screen.getByText("Waiting for the microphone…")).toBeInTheDocument();

    rerender(<AuraListening {...props} status="LISTENING" />);
    expect(screen.getByText("Listening…")).toBeInTheDocument();

    rerender(<AuraListening {...props} status="PROCESSING" />);
    expect(screen.getByText("Understanding…")).toBeInTheDocument();
  });

  it("keeps our own implementation out of what the visitor reads", () => {
    render(<AuraListening {...props} status="PROCESSING" />);

    const stage = document.querySelector('[data-state="PROCESSING"]')!;
    for (const ours of ["upload", "blob", "whisper", "openai", "transcri", "provider", "api"]) {
      expect(stage.textContent?.toLowerCase()).not.toContain(ours);
    }
  });

  it("shows a level meter while it is recording and replaces it once it is not", () => {
    const { rerender } = render(<AuraListening {...props} status="LISTENING" />);
    expect(meter()).not.toBeNull();
    // One measurement, shaped across nine bars — not nine measurements and not a random animation.
    expect(meter()!.children).toHaveLength(9);

    rerender(<AuraListening {...props} status="PROCESSING" />);
    // Frozen bars would look like a recording that had stopped working; the microphone is already
    // released and there is nothing left to measure.
    expect(meter()).toBeNull();
    expect(document.querySelector('[data-meter="working"]')).not.toBeNull();
  });

  it("writes the microphone level onto the meter rather than into React state", () => {
    // Ten times a second. As state this would re-render the panel — and the whole conversation —
    // ten times a second in order to animate nine bars.
    let publish: ((level: number) => void) | null = null;
    render(
      <AuraListening
        {...props}
        status="LISTENING"
        subscribeToLevel={(listener) => {
          publish = listener;
          return () => {};
        }}
      />,
    );

    expect(meter()!.getAttribute("style") ?? "").not.toContain("--aura-level");
    publish!(0.62);
    expect(meter()!.getAttribute("style")).toContain("--aura-level: 0.62");
  });

  it("counts the recording up, and only mentions the ceiling near it", () => {
    const { rerender } = render(<AuraListening {...props} status="LISTENING" elapsedSeconds={8} />);
    expect(screen.getByText("0:08")).toBeInTheDocument();
    expect(screen.queryByText(/left/)).not.toBeInTheDocument();

    rerender(<AuraListening {...props} status="LISTENING" elapsedSeconds={72} secondsLeft={8} />);
    expect(screen.getByText("1:12")).toBeInTheDocument();
    expect(screen.getByText("8s left")).toBeInTheDocument();
  });

  it("offers both ways out while recording, and neither while transcribing", () => {
    const { rerender } = render(<AuraListening {...props} status="LISTENING" />);
    expect(screen.getByRole("button", { name: "Cancel recording" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop recording/i })).toBeInTheDocument();

    rerender(<AuraListening {...props} status="PROCESSING" />);
    // The recording has already been sent. There is nothing left to stop or throw away.
    expect(screen.queryByRole("button", { name: "Cancel recording" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /stop recording/i })).not.toBeInTheDocument();
  });

  it("keeps the meter and the clock out of what a screen reader is told", () => {
    // A level meter that announced itself, or a clock that spoke every second, would make the
    // microphone unusable. The state is announced once, by the panel, in words.
    render(<AuraListening {...props} status="LISTENING" elapsedSeconds={4} />);

    expect(meter()).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("0:04").closest("p")).toHaveAttribute("aria-hidden", "true");
  });

  it("takes focus to Done, so a keyboard visitor can stop without hunting for it", () => {
    render(<AuraListening {...props} status="LISTENING" />);

    expect(document.activeElement).toBe(screen.getByRole("button", { name: /stop recording/i }));
  });

  it("keeps focus inside the panel when Done goes away", () => {
    // Focus left on an unmounted button falls to the document body, and the dialog's Tab cycle
    // loses its visitor for the second or two transcription takes.
    const { rerender } = render(<AuraListening {...props} status="LISTENING" />);
    rerender(<AuraListening {...props} status="PROCESSING" />);

    const stage = document.querySelector('[data-state="PROCESSING"]')!;
    expect(document.activeElement).toBe(stage);
    // Focusable deliberately; excluded from the Tab order just as deliberately.
    expect(stage).toHaveAttribute("tabindex", "-1");
  });
});

describe("the first time somebody reaches for the microphone", () => {
  it("introduces itself once, on the recording stage", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());

    // Nothing before the microphone is touched — the owner's finding 2.
    expect(screen.queryByText(/Speak naturally/)).not.toBeInTheDocument();

    await startRecording(user);

    const cue = screen.getByText("Speak naturally in your own language");
    expect(cue).toBeInTheDocument();
    // No named list, so somebody who speaks a fourth language is not told they are not invited.
    expect(cue.textContent).not.toMatch(/Tanglish|தமிழ்|English/);
    // No flag, no globe: the mark is Aura's own geometry, and it is decorative.
    expect(cue.textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}\u{1F310}]/u);
  });

  it("does not repeat it on the next recording", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await speak(user);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Message Aura" })).toHaveValue(
      "Tell me about MESA",
    ));

    await startRecording(user);

    expect(screen.queryByText(/Speak naturally/)).not.toBeInTheDocument();
  });

  it("tells a screen reader the same thing, in the panel's one live region", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await startRecording(user);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Aura is recording — speak naturally in your own language",
    );
  });

  it("still records when the browser will not let anything be remembered", async () => {
    // A private window, or site data blocked. The guidance appears again next time, which is a
    // repetition rather than a failure — voice never waits on an answer from storage.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    const voice = new FakeVoiceClient();
    const user = await openAura(new FakeAuraClient(), voice);
    await speak(user);

    await waitFor(() => expect(voice.uploads).toHaveLength(1));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Message Aura" })).toHaveValue("Tell me about MESA"),
    );
  });
});

describe("recording, from a visitor's side", () => {
  it("replaces the composer rather than tinting a button", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await startRecording(user);

    expect(meter()).not.toBeNull();
    // Nothing left to mistake for the idle state: no message box, no send, no microphone.
    expect(screen.queryByRole("textbox", { name: "Message Aura" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start voice input" })).not.toBeInTheDocument();
  });

  it("shows Understanding while the transcript is on its way, and the words when it lands", async () => {
    const voice = new FakeVoiceClient().holdsTranscription();
    const user = await openAura(new FakeAuraClient(), voice);
    await speak(user);

    expect(await screen.findByText("Understanding…")).toBeInTheDocument();

    voice.finishTranscription("Tell me about MESA");

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Message Aura" })).toHaveValue("Tell me about MESA"),
    );
    // Still the visitor's to send. Nothing a microphone picked up reaches the model on its own.
    expect(screen.queryByText("Understanding…")).not.toBeInTheDocument();
  });

  it("releases the microphone when the visitor is done", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await speak(user);

    await waitFor(() => expect(microphone!.tracks.every((track) => track.stopped)).toBe(true));
  });

  it("throws a cancelled recording away without ever sending it", async () => {
    const voice = new FakeVoiceClient();
    const chat = new FakeAuraClient();
    const user = await openAura(chat, voice);
    await startRecording(user);
    FakeMediaRecorder.latest().emit(50_000);

    await user.click(screen.getByRole("button", { name: "Cancel recording" }));

    // The whole point of Cancel: audio the visitor changed their mind about is not uploaded, not
    // transcribed, and never becomes a message.
    expect(voice.uploads).toHaveLength(0);
    expect(chat.sent).toHaveLength(0);
    await waitFor(() => expect(microphone!.tracks.every((track) => track.stopped)).toBe(true));
    expect(await screen.findByRole("textbox", { name: "Message Aura" })).toHaveValue("");
  });

  it("takes focus back to the composer when the stage closes", async () => {
    // Focus was on Done, which has just gone. Without this it falls to the document body and the
    // panel's Tab cycle loses its visitor.
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await startRecording(user);
    await user.click(screen.getByRole("button", { name: "Cancel recording" }));

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Message Aura" })),
    );
  });

  it("releases the microphone when the visitor starts a new conversation", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await speak(user);
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Message Aura" })).toHaveValue("Tell me about MESA"),
    );
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("MESA connects the floor.");

    await startRecording(user);
    await user.click(screen.getByRole("button", { name: "New" }));

    await waitFor(() => expect(microphone!.tracks.every((track) => track.stopped)).toBe(true));
    expect(screen.queryByText("Listening…")).not.toBeInTheDocument();
  });

  it("never leaves the stage up when the microphone was refused", async () => {
    microphone?.restore();
    microphone = installMicrophone(permissionError("NotAllowedError"));

    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await user.click(screen.getByRole("button", { name: "Start voice input" }));

    expect(
      await screen.findByText(/Microphone access is needed to talk with Aura/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Listening…")).not.toBeInTheDocument();
    // Voice is never the only way in.
    expect(screen.getByRole("textbox", { name: "Message Aura" })).toBeInTheDocument();
  });

  it("releases the microphone when the browser cannot record what it started", async () => {
    const user = await openAura(new FakeAuraClient(), new FakeVoiceClient());
    await startRecording(user);

    FakeMediaRecorder.latest().fail();

    await waitFor(() => expect(microphone!.tracks.every((track) => track.stopped)).toBe(true));
    expect(await screen.findByText(/didn't come through/)).toBeInTheDocument();
    expect(screen.queryByText("Listening…")).not.toBeInTheDocument();
  });
});
