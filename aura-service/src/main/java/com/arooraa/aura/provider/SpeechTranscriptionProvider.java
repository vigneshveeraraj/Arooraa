package com.arooraa.aura.provider;

/**
 * Speech-to-text, abstracted away from any single vendor — exactly as
 * {@link ChatGenerationProvider} and {@link EmbeddingProvider} already are. Application code
 * depends only on this interface and never branches on a provider name (frozen architecture
 * requirement); selection is configuration-driven, see {@code aura.voice.transcription.*}.
 *
 * <p>Voice is a channel into the one conversation pipeline, not a second assistant. Nothing here
 * knows what a conversation is: it turns audio into text, and the text then travels the same
 * validate → classify → retrieve → generate → guardrail path a typed message does.
 */
public interface SpeechTranscriptionProvider {

    /** False when voice is off or no real adapter could be wired — callers must check first. */
    boolean isEnabled();

    /**
     * @throws ProviderDisabledException if {@link #isEnabled()} is false
     * @throws ProviderTransientException on a timeout, rate limit or 5xx — worth retrying
     * @throws ProviderPermanentException on auth failure, an unusable request or an empty result
     */
    TranscriptionResult transcribe(TranscriptionRequest request);
}
