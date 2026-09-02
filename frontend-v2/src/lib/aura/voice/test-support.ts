import { vi } from "vitest";

/**
 * A microphone, a MediaRecorder and a MediaStream, none of which jsdom has.
 *
 * <p>Written as a fake rather than a mock library because the behaviour under test is a sequence —
 * permission resolves, recording starts, data arrives, stop fires — and a fake that can be driven
 * through that sequence step by step reads far better in a test than a stack of return-value
 * stubs. It also records whether the stream's tracks were stopped, which is the one thing about
 * the recorder that a visitor would notice if we got it wrong: the browser's recording indicator
 * staying lit after Aura is done.
 */

export interface FakeTrack {
  stopped: boolean;
  stop(): void;
}

export class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  /** What the browser claims it can record. Overridden per test to simulate Safari, etc. */
  static supportedTypes = ["audio/webm;codecs=opus", "audio/webm"];

  static isTypeSupported(type: string): boolean {
    return FakeMediaRecorder.supportedTypes.includes(type);
  }

  state: "inactive" | "recording" | "paused" = "inactive";
  mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(
    public stream: MediaStream,
    options?: { mimeType?: string },
  ) {
    this.mimeType = options?.mimeType ?? "audio/webm";
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.onstop?.();
  }

  /** Drives the "browser handed us a chunk" step. */
  emit(bytes: number) {
    this.ondataavailable?.({ data: new Blob([new Uint8Array(bytes)], { type: this.mimeType }) });
  }

  fail() {
    this.onerror?.();
  }

  static reset() {
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.supportedTypes = ["audio/webm;codecs=opus", "audio/webm"];
  }

  static latest(): FakeMediaRecorder {
    const instance = FakeMediaRecorder.instances[FakeMediaRecorder.instances.length - 1];
    if (!instance) throw new Error("no MediaRecorder was constructed");
    return instance;
  }
}

export function fakeStream(): { stream: MediaStream; tracks: FakeTrack[] } {
  const tracks: FakeTrack[] = [
    {
      stopped: false,
      stop() {
        this.stopped = true;
      },
    },
  ];
  return { stream: { getTracks: () => tracks } as unknown as MediaStream, tracks };
}

export interface MicrophoneHarness {
  tracks: FakeTrack[];
  getUserMedia: ReturnType<typeof vi.fn>;
  restore(): void;
}

/** Installs a working microphone. Pass a rejection to simulate a browser refusing one. */
export function installMicrophone(rejectWith?: Error): MicrophoneHarness {
  const { stream, tracks } = fakeStream();
  const getUserMedia = vi.fn(() => (rejectWith ? Promise.reject(rejectWith) : Promise.resolve(stream)));

  const originalMediaDevices = (navigator as { mediaDevices?: unknown }).mediaDevices;
  const originalRecorder = (globalThis as { MediaRecorder?: unknown }).MediaRecorder;

  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
    writable: true,
  });
  (globalThis as { MediaRecorder?: unknown }).MediaRecorder = FakeMediaRecorder;
  FakeMediaRecorder.reset();

  return {
    tracks,
    getUserMedia,
    restore() {
      Object.defineProperty(navigator, "mediaDevices", {
        value: originalMediaDevices,
        configurable: true,
        writable: true,
      });
      (globalThis as { MediaRecorder?: unknown }).MediaRecorder = originalRecorder;
      FakeMediaRecorder.reset();
    },
  };
}

/** Removes every recording API, which is what an http:// origin or an old browser looks like. */
export function removeMicrophoneSupport(): () => void {
  const originalMediaDevices = (navigator as { mediaDevices?: unknown }).mediaDevices;
  const originalRecorder = (globalThis as { MediaRecorder?: unknown }).MediaRecorder;

  Object.defineProperty(navigator, "mediaDevices", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;

  return () => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: originalMediaDevices,
      configurable: true,
      writable: true,
    });
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = originalRecorder;
  };
}

/** A named DOMException-shaped error, which is how getUserMedia reports every refusal. */
export function permissionError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

export function recordingBlob(bytes = 50_000, type = "audio/webm"): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

/**
 * jsdom has an `Audio` element but no media stack behind it: `play()` throws "not implemented".
 * This replaces it with something that records what it was asked to do and can be told to finish,
 * which is all the playback tests need — and it counts `revokeObjectURL`, because a blob URL that
 * is never revoked keeps its audio alive in the tab for as long as the page is open.
 */
export class FakeAudio {
  static instances: FakeAudio[] = [];
  static autoEnd = false;
  /** Simulates a browser's autoplay policy refusing to start sound. Reset by {@link reset}. */
  static refusePlay = false;

  paused = true;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private attributes = new Map<string, string>();

  constructor(public src: string) {
    FakeAudio.instances.push(this);
  }

  play(): Promise<void> {
    if (FakeAudio.refusePlay) return Promise.reject(new Error("NotAllowedError"));
    this.paused = false;
    if (FakeAudio.autoEnd) {
      queueMicrotask(() => this.end());
    }
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }

  load() {}

  /** Drives "the browser finished playing". */
  end() {
    this.paused = true;
    this.onended?.();
  }

  static reset() {
    FakeAudio.instances = [];
    FakeAudio.autoEnd = false;
    FakeAudio.refusePlay = false;
  }

  static latest(): FakeAudio {
    const instance = FakeAudio.instances[FakeAudio.instances.length - 1];
    if (!instance) throw new Error("nothing was played");
    return instance;
  }
}

export interface AudioHarness {
  revoked: string[];
  created: string[];
  restore(): void;
}

export function installAudio(): AudioHarness {
  const originalAudio = (globalThis as { Audio?: unknown }).Audio;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const created: string[] = [];
  const revoked: string[] = [];
  let counter = 0;

  FakeAudio.reset();
  (globalThis as { Audio?: unknown }).Audio = FakeAudio;
  URL.createObjectURL = ((): string => {
    counter += 1;
    const url = `blob:aura-test/${counter}`;
    created.push(url);
    return url;
  }) as typeof URL.createObjectURL;
  URL.revokeObjectURL = ((url: string) => {
    revoked.push(url);
  }) as typeof URL.revokeObjectURL;

  return {
    created,
    revoked,
    restore() {
      (globalThis as { Audio?: unknown }).Audio = originalAudio;
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      FakeAudio.reset();
    },
  };
}
