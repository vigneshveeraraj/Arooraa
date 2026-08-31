package com.arooraa.leads.contact.web.dto;

/** Never a DB id or internal metadata (W3.4 §10) — only what a confirmation screen needs. */
public record ContactMessageResponse(
        String contactReference,
        String status,
        String reason,
        String message
) {
    public static final String STATUS_RECEIVED = "NEW";
    public static final String DEFAULT_MESSAGE = "We've received your message and will get back to you.";
    public static final String ALREADY_RECEIVED_MESSAGE = "This message was already received.";
}
