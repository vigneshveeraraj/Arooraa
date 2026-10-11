package com.arooraa.leads.capture.exception;

/** Same Idempotency-Key, different body — handled as 409, never echoing the fingerprint or any field. */
public class LeadCaptureIdempotencyConflictException extends RuntimeException {

    public LeadCaptureIdempotencyConflictException() {
        super("This request key was already used with different details.");
    }
}
