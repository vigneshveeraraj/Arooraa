package com.arooraa.leads.careers.exception;

import java.util.Map;

/**
 * Field-safe validation failure for the multipart application endpoint (W3.3B §6). Jakarta
 * bean validation on a {@code @RequestBody} record doesn't apply cleanly to a multipart
 * {@code @RequestParam}-bound request, so {@code JobApplicationRequestValidator} builds this
 * directly — handled by the same response shape ({@code ErrorResponse}) as an ordinary
 * {@code MethodArgumentNotValidException}, so the frontend needs no special case for it.
 */
public class RecruitmentValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public RecruitmentValidationException(Map<String, String> fieldErrors) {
        super("Validation failed.");
        this.fieldErrors = Map.copyOf(fieldErrors);
    }

    public Map<String, String> fieldErrors() {
        return fieldErrors;
    }
}
