package com.arooraa.leads.careers.web.dto;

/**
 * Never a storage path, DB id, IP hash or internal filename (W3.3B §5) — only what a candidate
 * confirmation screen and a follow-up email need: a public reference, the accepted role, and a
 * safe status label.
 */
public record JobApplicationResponse(
        String applicationReference,
        String status,
        String jobSlug,
        String message
) {
    public static final String STATUS_RECEIVED = "RECEIVED";
    public static final String DEFAULT_MESSAGE =
            "We've received your application. You'll hear from AROORAA using the contact details you provided.";
    public static final String ALREADY_RECEIVED_MESSAGE = "This application was already received.";
}
