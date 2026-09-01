package com.arooraa.aura.conversation.pipeline;

/**
 * A visitor-fixable problem with the request itself. {@link #getMessage()} is safe to return to the
 * client verbatim — it says what to do differently and nothing about how the service works.
 */
public class InvalidInputException extends RuntimeException {

    private final String code;

    public InvalidInputException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
