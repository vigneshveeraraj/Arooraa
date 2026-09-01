package com.arooraa.aura.conversation;

/**
 * A conversation was requested for a profile that does not exist. Failing here rather than
 * defaulting is the point: an unrecognised profile code must never resolve to a broader profile's
 * capabilities.
 */
public class UnknownAssistantProfileException extends RuntimeException {

    public UnknownAssistantProfileException(String profileCode) {
        super("Unknown assistant profile: " + profileCode);
    }
}
