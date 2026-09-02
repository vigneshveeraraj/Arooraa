package com.arooraa.aura.provider;

/**
 * Text-to-speech, on the same terms as {@link SpeechTranscriptionProvider}: vendor-neutral,
 * configuration-selected ({@code aura.voice.synthesis.*}), and never a source of new content. What
 * it is handed is text Aura has already said — generated, guardrailed and shown to the visitor —
 * so speaking cannot introduce a claim the written answer did not make.
 */
public interface SpeechSynthesisProvider {

    boolean isEnabled();

    /**
     * @throws ProviderDisabledException if {@link #isEnabled()} is false
     * @throws ProviderTransientException on a timeout, rate limit or 5xx
     * @throws ProviderPermanentException on auth failure or an unusable request
     */
    SynthesisResult synthesize(SynthesisRequest request);
}
