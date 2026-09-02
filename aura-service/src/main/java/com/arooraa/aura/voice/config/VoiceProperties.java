package com.arooraa.aura.voice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Backed by {@code aura.voice.*}. Every value is external, and every switch is off by default:
 * a deployment that configures nothing has no voice endpoints, no microphone control in the
 * browser, and no way to spend a provider's money on audio.
 *
 * <p>{@code enabled} is a master switch above the two feature switches, so an operator can kill
 * all voice with one variable without having to remember both — which is what
 * {@link #transcriptionEnabled()} and {@link #synthesisEnabled()} exist to make explicit rather
 * than leaving each caller to remember the {@code &&}.
 */
@ConfigurationProperties(prefix = "aura.voice")
public record VoiceProperties(boolean enabled, Transcription transcription, Synthesis synthesis, Audio audio) {

    /**
     * Fills in any section a configuration source left out entirely. application.yml supplies all
     * of them, so this is not where the shipped defaults live — it is what keeps a context built
     * from a bare property source (a bean-graph test, a future module that imports only the
     * provider configuration) from handing a null section to code that then has to check for it.
     * Every default here is off or bounded, matching the file.
     */
    public VoiceProperties {
        if (transcription == null) {
            transcription = new Transcription(false, "openai", "whisper-1", 45, "");
        }
        if (synthesis == null) {
            synthesis = new Synthesis(false, "openai", "gpt-4o-mini-tts", "alloy", "mp3", 45, 700);
        }
        if (audio == null) {
            audio = new Audio(4_194_304L, 60, 400, 1024L);
        }
    }

    /**
     * @param language an ISO-639-1 code to force, or blank to let the provider detect. Blank is
     *        the default and the one we want: forcing a language is how Tanglish gets flattened
     */
    public record Transcription(boolean enabled, String provider, String model, int timeoutSeconds,
                                 String language) {
    }

    /**
     * @param maxCharacters the ceiling on how much of an answer is ever sent for synthesis, which
     *        is a cost control as much as a UX one — a long grounded answer is read on screen, not
     *        listened to end to end
     */
    public record Synthesis(boolean enabled, String provider, String model, String voice, String format,
                             int timeoutSeconds, int maxCharacters) {
    }

    /**
     * The bounds on an upload. {@code maxBytes} is the authoritative one — it is the only limit a
     * client cannot lie about, because the container counts the bytes itself.
     *
     * @param maxDurationSeconds enforced in the browser (the recorder stops itself) and re-checked
     *        here against the duration the client declares. A client that under-reports its
     *        duration still cannot exceed {@code maxBytes}, so this is a courtesy bound, not the
     *        security one
     * @param minDurationMillis rejects the "tapped the microphone by accident" recording before it
     *        costs a provider call
     */
    public record Audio(long maxBytes, int maxDurationSeconds, int minDurationMillis, long minBytes) {
    }

    public boolean transcriptionEnabled() {
        return enabled && transcription.enabled();
    }

    public boolean synthesisEnabled() {
        return enabled && synthesis.enabled();
    }
}
