import type { AuraVoiceController } from "./useAuraVoice";

/**
 * A voice channel that is available but does nothing.
 *
 * <p>Exists so the microphone, the speaker toggle, the recording stage and its one-time language
 * guidance can be rendered without a browser that can record or a backend that will transcribe —
 * which is what the design-system review page needs to photograph them, and what a component test
 * needs to assert against them.
 *
 * <p>Lives here rather than beside either caller because it was previously written out twice, and
 * both copies had to be found and edited every time the controller gained a field. It imports no
 * test framework, so the review page can use it without dragging one into the bundle; nothing in
 * the public panel imports it, so it never reaches a visitor.
 */
export function stubAuraVoice(overrides: Partial<AuraVoiceController> = {}): AuraVoiceController {
  return {
    available: true,
    speechAvailable: true,
    status: "IDLE",
    error: null,
    transcript: null,
    speakAnswers: false,
    secondsLeft: null,
    elapsedSeconds: 0,
    introducing: false,
    replayable: false,
    timings: { recordingMs: null, transcriptionMs: null, synthesisMs: null, turnMs: null },
    startListening: () => {},
    stopListening: () => {},
    cancelListening: () => {},
    consumeTranscript: () => {},
    reset: () => {},
    setSpeakAnswers: () => {},
    replay: () => {},
    announceAnswer: () => {},
    stopSpeaking: () => {},
    dismissError: () => {},
    subscribeToLevel: () => () => {},
    ...overrides,
  };
}
