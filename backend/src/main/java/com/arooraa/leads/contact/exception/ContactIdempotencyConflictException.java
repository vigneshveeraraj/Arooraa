package com.arooraa.leads.contact.exception;

/**
 * Thrown when a request reuses an {@code Idempotency-Key} whose stored fingerprint doesn't
 * match the incoming payload (W3.4 §12) — mirrors the project-enquiry/recruitment equivalents
 * exactly, kept as its own class so the contact domain has no compile-time dependency on either
 * package. Handled as 409 Conflict; never exposes the fingerprint or any field values.
 */
public class ContactIdempotencyConflictException extends RuntimeException {

    public ContactIdempotencyConflictException() {
        super("This request key was already used with different details.");
    }
}
