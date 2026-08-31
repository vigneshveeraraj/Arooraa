package com.arooraa.leads.careers.exception;

/**
 * Thrown when a request reuses an {@code Idempotency-Key} whose stored fingerprint doesn't
 * match the incoming payload (W3.3B §9) — mirrors project-enquiry's
 * IdempotencyConflictException exactly, kept as its own class so the recruitment domain has no
 * compile-time dependency on the sales/project package. Handled as 409 Conflict; never exposes
 * the fingerprint or any field values in the response.
 */
public class RecruitmentIdempotencyConflictException extends RuntimeException {

    public RecruitmentIdempotencyConflictException() {
        super("This request key was already used with different details.");
    }
}
