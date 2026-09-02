import { afterEach, describe, expect, it, vi } from "vitest";
import { isRecordingSupported, startRecording } from "./recorder";
import type { AuraRecording, AuraRecordingError } from "./recorder";
import {
  FakeMediaRecorder,
  installMicrophone,
  permissionError,
  removeMicrophoneSupport,
  type MicrophoneHarness,
} from "./test-support";

/**
 * The browser half of push-to-talk. Every test here is about a failure a real visitor will hit —
 * a denied permission, a laptop with no microphone, a browser that has never heard of
 * MediaRecorder — because that is the whole reason this file exists as its own layer.
 */
describe("the Aura recorder", () => {
  let harness: MicrophoneHarness | null = null;
  let restoreSupport: (() => void) | null = null;

  afterEach(() => {
    harness?.restore();
    harness = null;
    restoreSupport?.();
    restoreSupport = null;
    vi.useRealTimers();
  });

  /** Runs the whole happy path and hands back whatever the recorder produced. */
  async function record(options?: { bytes?: number }): Promise<
    { recording: AuraRecording | null; error: AuraRecordingError | null }
  > {
    let recording: AuraRecording | null = null;
    let error: AuraRecordingError | null = null;

    const handle = startRecording({
      maxSeconds: 60,
      onComplete: (result) => {
        recording = result;
      },
      onError: (failure) => {
        error = failure;
      },
    });

    await vi.waitFor(() => expect(FakeMediaRecorder.instances.length).toBe(1));
    FakeMediaRecorder.latest().emit(options?.bytes ?? 50_000);
    handle.stop();
    await vi.waitFor(() => expect(recording !== null || error !== null).toBe(true));
    return { recording, error };
  }

  it("reports no support when the browser has no recording APIs", () => {
    restoreSupport = removeMicrophoneSupport();
    expect(isRecordingSupported()).toBe(false);
  });

  it("fails immediately rather than asking for a microphone it cannot use", async () => {
    restoreSupport = removeMicrophoneSupport();
    const onError = vi.fn();

    startRecording({ maxSeconds: 60, onComplete: vi.fn(), onError });

    expect(onError).toHaveBeenCalledWith("UNSUPPORTED");
  });

  it("records, and hands back the blob with the type the browser actually produced", async () => {
    harness = installMicrophone();
    const { recording, error } = await record();

    expect(error).toBeNull();
    expect(recording).not.toBeNull();
    expect(recording!.blob.size).toBe(50_000);
    expect(recording!.mimeType).toBe("audio/webm;codecs=opus");
    expect(recording!.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("asks for the codec this browser supports rather than assuming one", async () => {
    harness = installMicrophone();
    // Safari, which records MP4 and has never heard of WebM.
    FakeMediaRecorder.supportedTypes = ["audio/mp4"];

    await record();

    expect(FakeMediaRecorder.latest().mimeType).toBe("audio/mp4");
  });

  it("lets the browser choose when it recognises none of our preferences", async () => {
    harness = installMicrophone();
    FakeMediaRecorder.supportedTypes = [];

    await record();

    // Constructed with no options at all — a recording in some unknown container still beats
    // refusing to record.
    expect(FakeMediaRecorder.instances.length).toBe(1);
  });

  it("releases the microphone when recording finishes", async () => {
    harness = installMicrophone();
    await record();

    // The visible consequence of getting this wrong is the browser's recording indicator staying
    // lit after Aura has finished, which looks exactly like a site that is still listening.
    expect(harness.tracks.every((track) => track.stopped)).toBe(true);
  });

  it("releases the microphone when the recording is cancelled", async () => {
    harness = installMicrophone();
    const onComplete = vi.fn();

    const handle = startRecording({ maxSeconds: 60, onComplete, onError: vi.fn() });
    await vi.waitFor(() => expect(FakeMediaRecorder.instances.length).toBe(1));
    FakeMediaRecorder.latest().emit(50_000);
    handle.cancel();

    expect(harness.tracks.every((track) => track.stopped)).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("throws away a recording cancelled while permission was still pending", async () => {
    harness = installMicrophone();
    const onComplete = vi.fn();
    const onError = vi.fn();

    const handle = startRecording({ maxSeconds: 60, onComplete, onError });
    handle.cancel();
    await Promise.resolve();
    await Promise.resolve();

    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("stops itself at the configured ceiling", async () => {
    vi.useFakeTimers();
    harness = installMicrophone();
    let recording: AuraRecording | null = null;

    startRecording({
      maxSeconds: 2,
      onComplete: (result) => {
        recording = result;
      },
      onError: vi.fn(),
    });

    await vi.waitFor(() => expect(FakeMediaRecorder.instances.length).toBe(1));
    FakeMediaRecorder.latest().emit(50_000);
    expect(recording).toBeNull();

    // A visitor who taps record and walks away costs one bounded upload, not an open microphone.
    vi.advanceTimersByTime(2_000);
    expect(recording).not.toBeNull();
  });

  it("treats a recording with nothing in it as nothing to send", async () => {
    harness = installMicrophone();
    const { recording, error } = await record({ bytes: 100 });

    expect(recording).toBeNull();
    expect(error).toBe("EMPTY_RECORDING");
  });

  it.each([
    ["NotAllowedError", "PERMISSION_DENIED"],
    ["PermissionDeniedError", "PERMISSION_DENIED"],
    ["SecurityError", "PERMISSION_DENIED"],
    ["NotFoundError", "NO_MICROPHONE"],
    ["DevicesNotFoundError", "NO_MICROPHONE"],
    ["OverconstrainedError", "NO_MICROPHONE"],
    ["NotReadableError", "MICROPHONE_BUSY"],
    ["TrackStartError", "MICROPHONE_BUSY"],
    ["SomethingNobodyHasSeen", "RECORDING_FAILED"],
  ])("classifies a %s from getUserMedia as %s", async (name, expected) => {
    harness = installMicrophone(permissionError(name));
    const onError = vi.fn();

    startRecording({ maxSeconds: 60, onComplete: vi.fn(), onError });

    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith(expected);
  });

  it("releases nothing it never held when permission is refused", async () => {
    harness = installMicrophone(permissionError("NotAllowedError"));
    const onError = vi.fn();

    startRecording({ maxSeconds: 60, onComplete: vi.fn(), onError });

    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(FakeMediaRecorder.instances.length).toBe(0);
  });

  it("reports a mid-recording failure rather than producing a broken blob", async () => {
    harness = installMicrophone();
    const onComplete = vi.fn();
    const onError = vi.fn();

    startRecording({ maxSeconds: 60, onComplete, onError });
    await vi.waitFor(() => expect(FakeMediaRecorder.instances.length).toBe(1));
    FakeMediaRecorder.latest().fail();

    expect(onError).toHaveBeenCalledWith("RECORDING_FAILED");
    expect(onComplete).not.toHaveBeenCalled();
    expect(harness.tracks.every((track) => track.stopped)).toBe(true);
  });

  it("asks for speech-shaped audio rather than raw microphone input", async () => {
    harness = installMicrophone();
    await record();

    expect(harness.getUserMedia).toHaveBeenCalledWith({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  });
});
