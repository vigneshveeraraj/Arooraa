package com.arooraa.aura.voice;

/**
 * A recording this service will not accept. Carries a stable code for the client to branch on and
 * a message written here — never one derived from a provider, a stack trace or a file path.
 */
public class InvalidAudioException extends RuntimeException {

    private final String code;

    public InvalidAudioException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
