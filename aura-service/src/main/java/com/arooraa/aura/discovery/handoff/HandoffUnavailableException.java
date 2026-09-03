package com.arooraa.aura.discovery.handoff;

/**
 * The Start Project workflow could not take this enquiry. Distinct from a refusal of consent or a
 * validation failure, both of which are the visitor's to fix; this one is ours, and it must never
 * leave a visitor believing their enquiry was sent.
 */
public class HandoffUnavailableException extends RuntimeException {

    private final String code;

    public HandoffUnavailableException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
