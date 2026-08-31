package com.arooraa.leads.project.exception;

/**
 * Thrown when a request reuses an {@code Idempotency-Key} whose stored fingerprint doesn't
 * match the incoming payload (W3.2B §24) — a client replaying a key with genuinely different
 * data, not a safe retry. Handled as 409 Conflict; never exposes the fingerprint or any field
 * values in the response.
 */
public class IdempotencyConflictException extends RuntimeException {

    public IdempotencyConflictException() {
        super("This request key was already used with different details.");
    }
}
