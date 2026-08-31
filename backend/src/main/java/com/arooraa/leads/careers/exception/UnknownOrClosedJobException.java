package com.arooraa.leads.careers.exception;

/**
 * The submitted {@code jobSlug} is not a currently-known, currently-open role (W3.3B §4) — an
 * unknown slug, a PLANNED role, or a CLOSED role all reach this same exception. Handled as a
 * field-safe 400, identical in shape to an ordinary validation error.
 */
public class UnknownOrClosedJobException extends RuntimeException {

    public UnknownOrClosedJobException() {
        super("This role is not currently accepting applications.");
    }
}
