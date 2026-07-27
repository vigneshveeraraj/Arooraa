package com.arooraa.leads.web.dto;

import java.util.UUID;

public record DemoRequestResponse(
        UUID requestId,
        String status,
        String message
) {
    public static final String STATUS_RECEIVED = "RECEIVED";
    public static final String STATUS_ALREADY_RECEIVED = "ALREADY_RECEIVED";

    public static final String DEFAULT_MESSAGE =
            "Thank you. Our team will contact you to arrange your personalised MESA demo.";
    public static final String ALREADY_RECEIVED_MESSAGE =
            "We already have your recent request and our team will contact you shortly.";
}
