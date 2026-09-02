package com.arooraa.aura.voice.api;

import java.util.UUID;

/**
 * The voice channel's wire contract. As with {@code ChatDtos}, safety here is by omission: there
 * is no field for a provider name, a model, a credential, an internal error or a file path, so
 * none can travel even if some future change tried to send one.
 */
public final class VoiceDtos {

    private VoiceDtos() {
    }

    /**
     * What the browser needs to know before it draws a microphone. Reports whether each half of
     * voice is available and how long a recording may run — the recorder stops itself at that
     * bound, which is why it is worth telling a client rather than only enforcing it.
     *
     * <p>No byte ceiling is published: the browser has no use for it, and the server rejects an
     * oversize upload whether or not a client knew the number.
     */
    public record Capabilities(boolean transcription, boolean synthesis, int maxRecordingSeconds) {
    }

    /** @param detectedLanguage what the provider thought it heard; advisory, may be null */
    public record TranscriptionResponse(String text, String detectedLanguage) {
    }

    /**
     * @param conversationId whose answer to speak
     * @param sequence which turn, or null for the latest — the difference between "speak this
     *        answer" and "say that again"
     */
    public record SpeakRequest(UUID conversationId, Integer sequence) {
    }

    public record ErrorResponse(String code, String message) {
    }
}
