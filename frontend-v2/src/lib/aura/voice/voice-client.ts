import { auraVoiceUrl } from "../client";
import { MAX_UPLOAD_BYTES, type AuraRecording } from "./recorder";

/**
 * The only place in the frontend that knows aura-service's voice HTTP shape. Same bargain as the
 * chat client: components talk to this interface, failures come back as values rather than
 * exceptions, and a test substitutes a fake rather than mocking `fetch`.
 *
 * <p>Audio is uploaded to aura-service and never to a provider. There is no key here, no provider
 * name, and no branch that could add one — the browser could not call OpenAI if it wanted to,
 * because it has never been told where or with what.
 */

export interface AuraVoiceCapabilities {
  transcription: boolean;
  synthesis: boolean;
  maxRecordingSeconds: number;
}

/** Why a voice call failed, in terms the UI can act on. */
export type AuraVoiceErrorKind =
  | "NETWORK"
  | "TIMEOUT"
  | "AUDIO_REJECTED"
  | "TOO_LARGE"
  | "UNAVAILABLE"
  | "NOTHING_TO_SPEAK"
  | "SERVER";

export interface AuraVoiceFailure {
  ok: false;
  kind: AuraVoiceErrorKind;
  /** Already visitor-safe: written here, never taken from a backend error body. */
  message: string;
}

export type AuraVoiceResult<T> = { ok: true; value: T } | AuraVoiceFailure;

export interface AuraVoiceApiClient {
  capabilities(): Promise<AuraVoiceCapabilities | null>;
  transcribe(recording: AuraRecording): Promise<AuraVoiceResult<string>>;
  speak(conversationId: string, sequence?: number | null): Promise<AuraVoiceResult<Blob>>;
}

const MESSAGES: Record<AuraVoiceErrorKind, string> = {
  NETWORK: "I couldn't send that recording. Check your connection and try again?",
  TIMEOUT: "That took longer than I'd like. Try saying it again?",
  AUDIO_REJECTED: "I couldn't make that out. Try saying it again?",
  TOO_LARGE: "That recording is longer than I can take in one go.",
  UNAVAILABLE: "I can't listen right now — type it to me instead?",
  NOTHING_TO_SPEAK: "There's nothing for me to say yet.",
  SERVER: "Something went wrong on my side. Try again in a moment?",
};

export function auraVoiceFailure(kind: AuraVoiceErrorKind): AuraVoiceFailure {
  return { ok: false, kind, message: MESSAGES[kind] };
}

/** Transcription is a slower call than chat — a real one lands around 1–3s, and a phone can be slow. */
const TRANSCRIBE_TIMEOUT_MS = 30_000;
const SPEAK_TIMEOUT_MS = 30_000;
const CAPABILITIES_TIMEOUT_MS = 6_000;

/**
 * The backend's own error codes, mapped to the kinds above. Anything unrecognised falls through
 * to the status-based classification, so a new backend code degrades to a sensible message rather
 * than to a blank one.
 */
const KIND_BY_CODE: Record<string, AuraVoiceErrorKind> = {
  UNSUPPORTED_AUDIO_TYPE: "AUDIO_REJECTED",
  AUDIO_TOO_SHORT: "AUDIO_REJECTED",
  AUDIO_UNREADABLE: "AUDIO_REJECTED",
  EMPTY_AUDIO: "AUDIO_REJECTED",
  AUDIO_TOO_LARGE: "TOO_LARGE",
  AUDIO_TOO_LONG: "TOO_LARGE",
  NOTHING_TO_SPEAK: "NOTHING_TO_SPEAK",
  TRANSCRIPTION_UNAVAILABLE: "UNAVAILABLE",
  SYNTHESIS_UNAVAILABLE: "UNAVAILABLE",
  TRANSCRIPTION_FAILED: "AUDIO_REJECTED",
  SYNTHESIS_FAILED: "UNAVAILABLE",
};

function classifyStatus(status: number): AuraVoiceErrorKind {
  if (status === 413) return "TOO_LARGE";
  if (status === 400) return "AUDIO_REJECTED";
  // 404 means voice is switched off on the backend, so the route does not exist at all — from the
  // visitor's side that is the same thing as unavailable.
  if (status === 404 || status === 403 || status === 503) return "UNAVAILABLE";
  return "SERVER";
}

async function withTimeout<T>(
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T | { failed: AuraVoiceErrorKind }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } catch (error) {
    return { failed: (error as Error)?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(timer);
  }
}

async function failureFrom(response: Response): Promise<AuraVoiceFailure> {
  const body = (await response.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code : "";
  return auraVoiceFailure(KIND_BY_CODE[code] ?? classifyStatus(response.status));
}

/** The extension the server expects for each container a browser might have recorded in. */
function filenameFor(mimeType: string): string {
  const bare = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (bare === "audio/mp4") return "speech.mp4";
  if (bare === "audio/mpeg") return "speech.mp3";
  if (bare === "audio/ogg") return "speech.ogg";
  if (bare === "audio/wav") return "speech.wav";
  return "speech.webm";
}

export function createAuraVoiceApiClient(): AuraVoiceApiClient {
  return {
    /**
     * Whether voice exists at all. Returns null on any failure — including the 404 that a backend
     * with voice switched off produces — so a caller has one thing to check and the microphone
     * simply does not appear.
     */
    async capabilities(): Promise<AuraVoiceCapabilities | null> {
      const result = await withTimeout(CAPABILITIES_TIMEOUT_MS, (signal) =>
        fetch(auraVoiceUrl("capabilities"), { signal }),
      );
      if ("failed" in result) return null;
      if (!result.ok) return null;

      const json = (await result.json().catch(() => null)) as Record<string, unknown> | null;
      if (!json) return null;
      return {
        transcription: json.transcription === true,
        synthesis: json.synthesis === true,
        maxRecordingSeconds:
          typeof json.maxRecordingSeconds === "number" && json.maxRecordingSeconds > 0
            ? json.maxRecordingSeconds
            : 60,
      };
    },

    async transcribe(recording: AuraRecording): Promise<AuraVoiceResult<string>> {
      // Checked here as well as on the server, so an over-long recording produces a sentence from
      // Aura rather than an upload the server aborts halfway through.
      if (recording.blob.size > MAX_UPLOAD_BYTES) return auraVoiceFailure("TOO_LARGE");

      const form = new FormData();
      // The filename is generated, not taken from anywhere — and the server discards it and makes
      // its own regardless. It exists because multipart parts want one.
      form.append("audio", recording.blob, filenameFor(recording.mimeType));
      form.append("durationMs", String(Math.round(recording.durationMs)));

      const result = await withTimeout(TRANSCRIBE_TIMEOUT_MS, (signal) =>
        fetch(auraVoiceUrl("transcriptions"), { method: "POST", body: form, signal }),
      );
      if ("failed" in result) return auraVoiceFailure(result.failed);
      if (!result.ok) return failureFrom(result);

      const json = (await result.json().catch(() => null)) as { text?: unknown } | null;
      const text = typeof json?.text === "string" ? json.text.trim() : "";
      if (text.length === 0) return auraVoiceFailure("AUDIO_REJECTED");
      return { ok: true, value: text };
    },

    async speak(conversationId: string, sequence?: number | null): Promise<AuraVoiceResult<Blob>> {
      const result = await withTimeout(SPEAK_TIMEOUT_MS, (signal) =>
        fetch(auraVoiceUrl("speech"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // No text field, because the endpoint has none: what is spoken is read from the
          // transcript server-side. See SpokenAnswerService.
          body: JSON.stringify({ conversationId, sequence: sequence ?? undefined }),
          signal,
        }),
      );
      if ("failed" in result) return auraVoiceFailure(result.failed);
      if (!result.ok) return failureFrom(result);

      const blob = await result.blob().catch(() => null);
      if (!blob || blob.size === 0) return auraVoiceFailure("SERVER");
      return { ok: true, value: blob };
    },
  };
}
