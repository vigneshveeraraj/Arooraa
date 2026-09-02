"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { AuraState } from "../state";
import { createAuraSpeaker } from "./playback";
import {
  getSpeakAnswersServerSnapshot,
  getSpeakAnswersSnapshot,
  storeSpeakAnswersPreference,
  subscribeToSpeakAnswers,
} from "./preference";
import {
  startRecording,
  isRecordingSupported,
  type AuraRecorderHandle,
  type AuraRecordingError,
} from "./recorder";
import {
  createAuraVoiceApiClient,
  type AuraVoiceApiClient,
  type AuraVoiceCapabilities,
} from "./voice-client";

/**
 * Everything about voice that is not visual: permission, recording, transcription, playback and
 * the one preference. Components below raise intent and render what comes back.
 *
 * <p>The design decision worth naming is what happens to a transcript. It is <em>not</em> sent
 * automatically. It lands in the composer, where the visitor can read it, correct it and press
 * send — the same textarea, the same button, the same conversation.
 *
 * <p>Auto-submitting would be smoother for a perfect transcription and worse for every other case,
 * and the cases most likely to be imperfect are exactly the ones this milestone exists to support:
 * Tamil, and code-mixed Tanglish. Three things follow from letting the visitor confirm. They can
 * see what Aura understood, which the brief requires outright. A mishearing costs a glance rather
 * than a wrong answer sitting permanently in the conversation's memory. And nothing a microphone
 * picks up — a passing conversation, a television — can ever reach the model without a person
 * having read it first, which matters more once A6 lets a conversation end in a project enquiry.
 */

export type AuraVoiceStatus = "IDLE" | "REQUESTING" | "LISTENING" | "PROCESSING" | "SPEAKING";

export interface AuraVoiceTranscript {
  /** Increments per transcript, so a consumer can tell a repeat from a re-render. */
  id: number;
  text: string;
}

export interface AuraVoiceController {
  /** The browser can record at all — false on http:// origins and in older browsers. */
  supported: boolean;
  /** The browser can record and the backend will transcribe. Gates the microphone control. */
  available: boolean;
  /** The backend will speak. Gates the speaker control. */
  speechAvailable: boolean;
  status: AuraVoiceStatus;
  /** Visitor-facing, already safe to render. Never a provider message or a browser error name. */
  error: string | null;
  transcript: AuraVoiceTranscript | null;
  speakAnswers: boolean;
  maxRecordingSeconds: number;

  startListening(): void;
  stopListening(): void;
  cancelListening(): void;
  setSpeakAnswers(speak: boolean): void;
  /** Explicit "say that again" — always speaks, whatever the preference says. */
  replay(conversationId: string, sequence?: number | null): void;
  /** Called when an answer arrives; speaks it only if the visitor has asked to be spoken to. */
  announceAnswer(conversationId: string, spokenTurn: boolean): void;
  stopSpeaking(): void;
  dismissError(): void;
}

const RECORDING_MESSAGES: Record<AuraRecordingError, string> = {
  UNSUPPORTED: "This browser won't let me listen here — type it to me instead?",
  PERMISSION_DENIED:
    "I'll need microphone permission to hear you. You can allow it in your browser, or just type.",
  NO_MICROPHONE: "I can't find a microphone on this device — type it to me instead?",
  MICROPHONE_BUSY: "Something else is using the microphone right now. Try again in a moment?",
  RECORDING_FAILED: "That recording didn't come through. Try again?",
  EMPTY_RECORDING: "I didn't catch anything there. Tap the microphone and speak?",
};

export interface UseAuraVoiceOptions {
  /** Injected by tests; production always uses the real client. */
  client?: AuraVoiceApiClient;
  /** Skips the capability probe entirely. Used by the design-system review page. */
  capabilities?: AuraVoiceCapabilities;
}

/** How the voice status shows up on the Aura Spark. Null means voice has nothing to say. */
export function voicePresence(status: AuraVoiceStatus): AuraState | null {
  switch (status) {
    case "REQUESTING":
    case "LISTENING":
      return "LISTENING";
    case "PROCESSING":
      return "PROCESSING_AUDIO";
    case "SPEAKING":
      return "SPEAKING";
    default:
      return null;
  }
}

let transcriptCounter = 0;

export function useAuraVoice({ client, capabilities }: UseAuraVoiceOptions = {}): AuraVoiceController {
  const api = useMemo(() => client ?? createAuraVoiceApiClient(), [client]);
  const speaker = useMemo(() => createAuraSpeaker(), []);

  const supported = useMemo(() => isRecordingSupported(), []);
  const [probed, setProbed] = useState<AuraVoiceCapabilities | null>(capabilities ?? null);
  const [status, setStatus] = useState<AuraVoiceStatus>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<AuraVoiceTranscript | null>(null);

  // Read as an external store rather than copied into state. This page is statically exported, so
  // `window` does not exist during the prerender; the server snapshot is the default, the client
  // snapshot is whatever the browser remembered, and React reconciles the two itself instead of
  // us doing it in an effect one render late.
  const speakAnswers = useSyncExternalStore(
    subscribeToSpeakAnswers,
    getSpeakAnswersSnapshot,
    getSpeakAnswersServerSnapshot,
  );

  const recorder = useRef<AuraRecorderHandle | null>(null);

  // Asking the backend what it can do, once. A failure — including the 404 a backend with voice
  // switched off produces — leaves this null, and the microphone simply never appears.
  useEffect(() => {
    if (!supported || capabilities) return;
    let cancelled = false;
    void api.capabilities().then((result) => {
      if (!cancelled) setProbed(result);
    });
    return () => {
      cancelled = true;
    };
  }, [api, capabilities, supported]);

  useEffect(
    () => () => {
      recorder.current?.cancel();
      speaker.dispose();
    },
    [speaker],
  );

  const stopSpeaking = useCallback(() => {
    speaker.stop();
    setStatus((current) => (current === "SPEAKING" ? "IDLE" : current));
  }, [speaker]);

  const play = useCallback(
    async (conversationId: string, sequence?: number | null) => {
      const result = await api.speak(conversationId, sequence ?? null);
      if (!result.ok) {
        // Not being able to speak is not worth interrupting a visitor over: the answer they asked
        // for is already on screen and perfectly readable. Only an explicit replay says anything,
        // and it says it through the same error line as everything else.
        setStatus("IDLE");
        return result.message;
      }
      setStatus("SPEAKING");
      await speaker.play(result.value);
      setStatus((current) => (current === "SPEAKING" ? "IDLE" : current));
      return null;
    },
    [api, speaker],
  );

  const startListening = useCallback(() => {
    if (!supported || recorder.current) return;
    // Interrupting Aura mid-sentence is the point of tapping the microphone while it is talking.
    speaker.stop();
    setError(null);
    setStatus("REQUESTING");

    recorder.current = startRecording({
      maxSeconds: probed?.maxRecordingSeconds ?? 60,
      onListening: () => setStatus("LISTENING"),
      onError: (failure) => {
        recorder.current = null;
        setStatus("IDLE");
        setError(RECORDING_MESSAGES[failure]);
      },
      onComplete: (recording) => {
        recorder.current = null;
        setStatus("PROCESSING");
        void api.transcribe(recording).then((result) => {
          setStatus("IDLE");
          if (!result.ok) {
            setError(result.message);
            return;
          }
          transcriptCounter += 1;
          setTranscript({ id: transcriptCounter, text: result.value });
        });
      },
    });
  }, [api, probed, speaker, supported]);

  const stopListening = useCallback(() => {
    recorder.current?.stop();
    recorder.current = null;
  }, []);

  const cancelListening = useCallback(() => {
    recorder.current?.cancel();
    recorder.current = null;
    setStatus("IDLE");
  }, []);

  const setSpeakAnswers = useCallback(
    (speak: boolean) => {
      // Writing to the store is the whole update: the subscription above brings it back as the
      // rendered value, so there is no second copy in component state to fall out of step.
      storeSpeakAnswersPreference(speak);
      if (!speak) stopSpeaking();
    },
    [stopSpeaking],
  );

  const replay = useCallback(
    (conversationId: string, sequence?: number | null) => {
      void play(conversationId, sequence).then((message) => {
        if (message) setError(message);
      });
    },
    [play],
  );

  /**
   * Aura speaks an answer when the visitor has asked to be spoken to — either by turning speech on
   * or, for this one turn, by having asked the question out loud. Someone who typed and never
   * touched the speaker control hears nothing, which is the behaviour a browser's own autoplay
   * rules are trying to protect and the one a visitor expects.
   */
  const announceAnswer = useCallback(
    (conversationId: string, spokenTurn: boolean) => {
      if (!probed?.synthesis) return;
      if (!speakAnswers && !spokenTurn) return;
      void play(conversationId, null);
    },
    [play, probed, speakAnswers],
  );

  return {
    supported,
    available: supported && probed?.transcription === true,
    speechAvailable: probed?.synthesis === true,
    status,
    error,
    transcript,
    speakAnswers,
    maxRecordingSeconds: probed?.maxRecordingSeconds ?? 60,
    startListening,
    stopListening,
    cancelListening,
    setSpeakAnswers,
    replay,
    announceAnswer,
    stopSpeaking,
    dismissError: useCallback(() => setError(null), []),
  };
}
