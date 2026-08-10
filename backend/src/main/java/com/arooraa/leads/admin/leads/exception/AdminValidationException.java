package com.arooraa.leads.admin.leads.exception;

/** Generic 400-level validation failure across the admin lead-management surface. */
public class AdminValidationException extends RuntimeException {

    public AdminValidationException(String message) {
        super(message);
    }
}
