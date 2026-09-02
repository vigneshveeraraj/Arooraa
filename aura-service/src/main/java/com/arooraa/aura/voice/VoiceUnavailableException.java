package com.arooraa.aura.voice;

/**
 * Voice could not do its job — switched off, or the provider failed. Distinct from
 * {@link InvalidAudioException}, which is the visitor's recording to fix; this one is ours, and it
 * maps to a different status and a different thing for Aura to say.
 */
public class VoiceUnavailableException extends RuntimeException {

    private final String code;

    public VoiceUnavailableException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
