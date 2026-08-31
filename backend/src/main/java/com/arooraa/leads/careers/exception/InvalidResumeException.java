package com.arooraa.leads.careers.exception;

/**
 * A résumé upload failed validation (wrong type, too large, empty, or content that doesn't
 * match its declared type) — handled as a field-safe 400, same shape as ordinary bean-validation
 * errors (W3.3B §6). Never includes the file's own bytes or name in the message.
 */
public class InvalidResumeException extends RuntimeException {

    public InvalidResumeException(String message) {
        super(message);
    }
}
