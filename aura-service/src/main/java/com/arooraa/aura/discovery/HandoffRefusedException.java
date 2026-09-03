package com.arooraa.aura.discovery;

/**
 * Aura will not send this — because consent was not given, because the brief has not been seen, or
 * because there is not enough in it. All three are things the visitor can put right, so all three
 * carry a sentence saying how.
 */
public class HandoffRefusedException extends RuntimeException {

    private final String code;

    public HandoffRefusedException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
