package com.arooraa.leads.admin.web;

import com.arooraa.leads.admin.auth.service.AdminAuthService;
import com.arooraa.leads.admin.leads.exception.AdminValidationException;
import com.arooraa.leads.admin.leads.exception.LeadManagementConflictException;
import com.arooraa.leads.admin.leads.exception.LeadNotFoundException;
import com.arooraa.leads.web.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Scoped to the admin package only, so it can never interfere with the public
 * demo-request/project-enquiry GlobalExceptionHandler. Deliberately does NOT declare a
 * catch-all Exception handler here — the existing unscoped GlobalExceptionHandler already
 * covers validation errors, unreadable bodies, rate limiting and unexpected failures for
 * every controller including these; duplicating an Exception.class handler across two
 * advices risks an "Ambiguous @ExceptionHandler" resolution error.
 */
@RestControllerAdvice(basePackages = "com.arooraa.leads.admin")
public class AdminExceptionHandler {

    @ExceptionHandler(AdminAuthService.InvalidAdminCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(AdminAuthService.InvalidAdminCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("INVALID_CREDENTIALS", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(LeadNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleLeadNotFound(LeadNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(LeadManagementConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(LeadManagementConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("CONFLICT", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(AdminValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(AdminValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage(), Map.of()));
    }
}
