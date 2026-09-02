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

/**
 * How long each stage of the last voice turn took. Internal only: read by the developer inspector,
 * which no public build contains, and never rendered to a visitor. Timing a conversation is
 * something we need in order to make it faster, not something anyone came here to read.
 */
export interface AuraVoiceTimings {
  /** How long the visitor spoke for. */
  recordingMs: number | null;
  /** Upload plus transcription, as the browser experienced it. */
  transcriptionMs: number | null;
  /** The synthesis request, likewise. */
  synthesisMs: number | null;
  /** Microphone released to first audible word — the number a visitor actually feels. */
  turnMs: number | null;
}

export interface AuraVoiceController {
  /**
   * The browser can record <em>and</em> the backend will transcribe. One flag rather than two,
   * because nothing downstream has a different thing to say about the two reasons: on an
   * http:// origin, an old browser, or a backend with voice off, the microphone is simply absent.
   */
  available: boolean;
  /** The backend will speak. Gates the speaker control, separately — they are separate costs. */
  speechAvailable: boolean;
  status: AuraVoiceStatus;
  /** Visitor-facing, already safe to render. Never a provider message or a browser error name. */
  error: string | null;
  transcript: AuraVoiceTranscript | null;
  speakAnswers: boolean;
  /**
   * Seconds left before the recorder stops itself, but only once that is close enough to matter.
   * Null for most of a recording: a stopwatch running from the first word would make an ordinary
   * question feel timed.
   */
  secondsLeft: number | null;
  /** True when Aura has just finished reading an answer and it can be heard again. */
  replayable: boolean;
  timings: AuraVoiceTimings;

  startListening(): void;
  stopListening(): void;
  cancelListening(): void;
  setSpeakAnswers(speak: boolean): void;
  /** Explicit "say that again" — always speaks, whatever the preference says. */
  replay(): void;
  /** Called when an answer arrives; speaks it only if the visitor has asked to be spoken to. */
  announceAnswer(conversationId: string, spokenTurn: boolean): void;
  stopSpeaking(): void;
  dismissError(): void;
  /**
   * Microphone loudness, 0 to 1, about ten times a second. A subscription rather than state on
   * purpose: at that rate a re-render would rebuild the whole conversation ten times a second to
   * animate one button, so the button reads it and writes it straight to its own element.
   */
  subscribeToLevel(listener: (level: number) => void): () => void;
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

/** How close to the ceiling a recording has to get before the visitor is told about it. */
const COUNTDOWN_FROM_SECONDS = 15;

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

const NO_TIMINGS: AuraVoiceTimings = {
  recordingMs: null,
  transcriptionMs: null,
  synthesisMs: null,
  turnMs: null,
};

let transcriptCounter = 0;

export function useAuraVoice({ client, capabilities }: UseAuraVoiceOptions = {}): AuraVoiceController {
  const api = useMemo(() => client ?? createAuraVoiceApiClient(), [client]);
  const speaker = useMemo(() => createAuraSpeaker(), []);

  const supported = useMemo(() => isRecordingSupported(), []);
  const [probed, setProbed] = useState<AuraVoiceCapabilities | null>(capabilities ?? null);
  const [status, setStatus] = useState<AuraVoiceStatus>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<AuraVoiceTranscript | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [replayTarget, setReplayTarget] = useState<string | null>(null);
  const [timings, setTimings] = useState<AuraVoiceTimings>(NO_TIMINGS);

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
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelListeners = useRef(new Set<(level: number) => void>());
  /** When the microphone was released, which is where the visitor's wait actually starts. */
  const turnStartedAt = useRef<number | null>(null);

  const stopCountdown = useCallback(() => {
    if (countdown.current) clearInterval(countdown.current);
    countdown.current = null;
    setSecondsLeft(null);
  }, []);

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
      if (countdown.current) clearInterval(countdown.current);
      speaker.dispose();
    },
    [speaker],
  );

  const stopSpeaking = useCallback(() => {
    speaker.stop();
    setStatus((current) => (current === "SPEAKING" ? "IDLE" : current));
  }, [speaker]);

  const play = useCallback(
    async (conversationId: string) => {
      const requestedAt = Date.now();
      const result = await api.speak(conversationId, null);
      const synthesisMs = Date.now() - requestedAt;
      if (!result.ok) {
        // Not being able to speak is not worth interrupting a visitor over: the answer they asked
        // for is already on screen and perfectly readable. Only an explicit replay says anything,
        // and it says it through the same error line as everything else.
        setStatus("IDLE");
        return result.message;
      }

      const startedSpeakingAt = Date.now();
      setTimings((current) => ({
        ...current,
        synthesisMs,
        turnMs: turnStartedAt.current === null ? null : startedSpeakingAt - turnStartedAt.current,
      }));
      turnStartedAt.current = null;

      setStatus("SPEAKING");
      await speaker.play(result.value);
      setStatus((current) => (current === "SPEAKING" ? "IDLE" : current));
      setReplayTarget(conversationId);
      return null;
    },
    [api, speaker],
  );

  const startListening = useCallback(() => {
    if (!supported || recorder.current) return;
    // Interrupting Aura mid-sentence is the point of tapping the microphone while it is talking.
    // Local playback only — this is not barge-in against a model that is still generating.
    speaker.stop();
    setError(null);
    setReplayTarget(null);
    setStatus("REQUESTING");

    const maxSeconds = probed?.maxRecordingSeconds ?? 60;
    const startedAt = Date.now();

    recorder.current = startRecording({
      maxSeconds,
      onLevel: (level) => levelListeners.current.forEach((listener) => listener(level)),
      onListening: () => {
        setStatus("LISTENING");
        countdown.current = setInterval(() => {
          const remaining = Math.max(0, maxSeconds - Math.round((Date.now() - startedAt) / 1000));
          setSecondsLeft(remaining <= COUNTDOWN_FROM_SECONDS ? remaining : null);
        }, 1000);
      },
      onError: (failure) => {
        recorder.current = null;
        stopCountdown();
        setStatus("IDLE");
        setError(RECORDING_MESSAGES[failure]);
      },
      onComplete: (recording) => {
        recorder.current = null;
        stopCountdown();
        setStatus("PROCESSING");
        turnStartedAt.current = Date.now();

        const requestedAt = Date.now();
        void api.transcribe(recording).then((result) => {
          setTimings({
            recordingMs: Math.round(recording.durationMs),
            transcriptionMs: Date.now() - requestedAt,
            synthesisMs: null,
            turnMs: null,
          });
          setStatus("IDLE");
          if (!result.ok) {
            turnStartedAt.current = null;
            setError(result.message);
            return;
          }
          transcriptCounter += 1;
          setTranscript({ id: transcriptCounter, text: result.value });
        });
      },
    });
  }, [api, probed, speaker, stopCountdown, supported]);

  const stopListening = useCallback(() => {
    recorder.current?.stop();
    recorder.current = null;
    stopCountdown();
  }, [stopCountdown]);

  const cancelListening = useCallback(() => {
    recorder.current?.cancel();
    recorder.current = null;
    stopCountdown();
    setStatus("IDLE");
  }, [stopCountdown]);

  /*
   * A backgrounded tab is not a visitor who has finished speaking, but it is a visitor who has
   * stopped watching — and browsers are free to suspend a stream they think nobody is using. The
   * recording is finished rather than thrown away, so whatever they had already said survives and
   * arrives in the composer for them to find when they come back.
   */
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden" && recorder.current) stopListening();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [stopListening]);

  const setSpeakAnswers = useCallback(
    (speak: boolean) => {
      // Writing to the store is the whole update: the subscription above brings it back as the
      // rendered value, so there is no second copy in component state to fall out of step.
      storeSpeakAnswersPreference(speak);
      if (!speak) stopSpeaking();
    },
    [stopSpeaking],
  );

  const replay = useCallback(() => {
    const target = replayTarget;
    if (!target) return;
    void play(target).then((message) => {
      // A replay is an explicit request, so unlike an automatic one it does say when it failed.
      if (message) setError(message);
    });
  }, [play, replayTarget]);

  /**
   * Aura speaks an answer when the visitor has asked to be spoken to — either by turning speech on
   * or, for this one turn, by having asked the question out loud. Someone who typed and never
   * touched the speaker control hears nothing, which is the behaviour a browser's own autoplay
   * rules are trying to protect and the one a visitor expects.
   */
  const announceAnswer = useCallback(
    (conversationId: string, spokenTurn: boolean) => {
      if (!probed?.synthesis || (!speakAnswers && !spokenTurn)) {
        // A new answer nobody is going to hear also means the previous one is no longer the thing
        // "play again" would sensibly play.
        setReplayTarget(null);
        turnStartedAt.current = null;
        return;
      }
      void play(conversationId);
    },
    [play, probed, speakAnswers],
  );

  const subscribeToLevel = useCallback((listener: (level: number) => void) => {
    const listeners = levelListeners.current;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    available: supported && probed?.transcription === true,
    speechAvailable: probed?.synthesis === true,
    status,
    error,
    transcript,
    speakAnswers,
    secondsLeft,
    replayable: replayTarget !== null && status !== "SPEAKING",
    timings,
    startListening,
    stopListening,
    cancelListening,
    setSpeakAnswers,
    replay,
    announceAnswer,
    stopSpeaking,
    dismissError: useCallback(() => setError(null), []),
    subscribeToLevel,
  };
}
