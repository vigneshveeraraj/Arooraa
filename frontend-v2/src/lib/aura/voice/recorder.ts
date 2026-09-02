/**
 * The browser half of push-to-talk: microphone permission, recording, and stopping cleanly.
 *
 * <p>Deliberately knows nothing about Aura. It produces a blob and a duration, or one of a small
 * set of named failures, and the layer above decides what any of that means. That keeps every
 * browser quirk — and there are several — in one file that can be reasoned about on its own.
 */

/** Why recording could not start or finish. Each maps to one thing Aura says. */
export type AuraRecordingError =
  | "UNSUPPORTED"
  | "PERMISSION_DENIED"
  | "NO_MICROPHONE"
  | "MICROPHONE_BUSY"
  | "RECORDING_FAILED"
  | "EMPTY_RECORDING";

export interface AuraRecording {
  blob: Blob;
  /** What the browser recorded, in milliseconds. Sent to the backend as advisory context. */
  durationMs: number;
  mimeType: string;
}

export interface AuraRecorderHandle {
  /** Finish and hand back the recording. */
  stop(): void;
  /** Throw the recording away — the visitor changed their mind, or the panel closed. */
  cancel(): void;
}

export interface StartRecordingOptions {
  /** The recorder stops itself here, so a forgotten microphone cannot run indefinitely. */
  maxSeconds: number;
  onComplete(recording: AuraRecording): void;
  onError(error: AuraRecordingError): void;
  /** Fired once permission is granted and audio is actually being captured. */
  onListening?(): void;
}

/**
 * What each browser will actually record in, best first. Chrome and Firefox give WebM/Opus, which
 * is small and widely transcribable; Safari gives MP4/AAC. The empty string at the end lets the
 * browser choose when it recognises none of these, which is better than refusing to record.
 */
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "",
];

/**
 * A ceiling checked before anything is uploaded. The server enforces its own and is the authority;
 * this exists so a legitimate visitor gets a sentence from Aura rather than a request the server
 * aborts mid-flight. Kept in step with aura.voice.audio.max-bytes.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Below this there is nothing to transcribe — an accidental tap, or a stream that never opened. */
const MIN_RECORDING_BYTES = 1024;

export function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    // Absent on http:// origins other than localhost, which is the most likely reason a developer
    // finds the microphone missing.
    navigator.mediaDevices?.getUserMedia !== undefined
  );
}

function pickMimeType(): string {
  for (const candidate of PREFERRED_MIME_TYPES) {
    if (candidate === "") return "";
    if (MediaRecorder.isTypeSupported?.(candidate)) return candidate;
  }
  return "";
}

/** getUserMedia's failure names, which differ between browsers and between versions of the spec. */
function classifyPermissionFailure(error: unknown): AuraRecordingError {
  const name = (error as Error)?.name ?? "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "PERMISSION_DENIED";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return "NO_MICROPHONE";
  }
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
    return "MICROPHONE_BUSY";
  }
  return "RECORDING_FAILED";
}

/**
 * Asks for the microphone and starts recording. Returns a handle as soon as the attempt begins —
 * permission is asynchronous, so `stop()` may be called before the stream even opens, and the
 * handle honours that by cancelling the attempt rather than dropping it.
 */
export function startRecording(options: StartRecordingOptions): AuraRecorderHandle {
  if (!isRecordingSupported()) {
    options.onError("UNSUPPORTED");
    return { stop: () => {}, cancel: () => {} };
  }

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let abandoned = false;
  let finished = false;
  let autoStop: ReturnType<typeof setTimeout> | null = null;
  const chunks: Blob[] = [];
  const startedAt = Date.now();

  /**
   * Releases the microphone. Called on every exit — success, failure and cancellation alike —
   * because a stream left open keeps the browser's recording indicator lit, which is alarming and
   * entirely our fault when it happens.
   */
  function release() {
    if (autoStop) clearTimeout(autoStop);
    autoStop = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  navigator.mediaDevices
    .getUserMedia({
      audio: {
        // Speech, in a room, on a phone. These are hints; a browser that ignores them still works.
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    .then((granted) => {
      if (abandoned) {
        granted.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = granted;

      const mimeType = pickMimeType();
      recorder = new MediaRecorder(granted, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      recorder.onerror = () => {
        if (finished) return;
        finished = true;
        release();
        options.onError("RECORDING_FAILED");
      };

      recorder.onstop = () => {
        if (finished) return;
        finished = true;
        const durationMs = Date.now() - startedAt;
        release();
        if (abandoned) return;

        // `recorder.mimeType` rather than our requested one: the browser is allowed to pick
        // something else, and what it actually produced is what the server has to be told about.
        const type = recorder?.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        if (blob.size < MIN_RECORDING_BYTES) {
          options.onError("EMPTY_RECORDING");
          return;
        }
        options.onComplete({ blob, durationMs, mimeType: type });
      };

      recorder.start();
      options.onListening?.();

      // The safety net. A visitor who taps record and walks away should cost one bounded upload,
      // not an open microphone — and the server would refuse anything longer anyway.
      autoStop = setTimeout(() => {
        if (recorder?.state === "recording") recorder.stop();
      }, options.maxSeconds * 1000);
    })
    .catch((error) => {
      if (abandoned) return;
      finished = true;
      release();
      options.onError(classifyPermissionFailure(error));
    });

  return {
    stop() {
      if (finished) return;
      if (recorder?.state === "recording") {
        recorder.stop();
      } else {
        // Permission is still pending, so there is nothing recorded to keep. Treat it as a
        // cancellation rather than leaving a request in flight that will open a microphone
        // nobody is waiting for any more.
        abandoned = true;
        finished = true;
        release();
      }
    },
    cancel() {
      abandoned = true;
      if (finished) {
        release();
        return;
      }
      finished = true;
      if (recorder?.state === "recording") recorder.stop();
      release();
    },
  };
}
