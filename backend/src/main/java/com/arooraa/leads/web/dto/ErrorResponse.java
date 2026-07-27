package com.arooraa.leads.web.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        Map<String, String> fieldErrors,
        Instant timestamp
) {
    public ErrorResponse(String code, String message, Map<String, String> fieldErrors) {
        this(code, message, fieldErrors, Instant.now());
    }
}
