package com.arooraa.leads.web;

import com.arooraa.leads.careers.exception.InvalidResumeException;
import com.arooraa.leads.careers.exception.RecruitmentIdempotencyConflictException;
import com.arooraa.leads.careers.exception.RecruitmentValidationException;
import com.arooraa.leads.careers.exception.UnknownOrClosedJobException;
import com.arooraa.leads.contact.exception.ContactIdempotencyConflictException;
import com.arooraa.leads.exception.RateLimitExceededException;
import com.arooraa.leads.project.exception.IdempotencyConflictException;
import com.arooraa.leads.web.dto.ErrorResponse;
import tools.jackson.databind.exc.InvalidFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String GENERIC_VALIDATION_MESSAGE = "Please correct the highlighted fields.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        log.warn("demo-request rejected reason=VALIDATION_ERROR fields={}", fieldErrors.keySet());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE, fieldErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife && !ife.getPath().isEmpty()) {
            String field = ife.getPath().get(ife.getPath().size() - 1).getPropertyName();
            if (field != null) {
                fieldErrors.put(field, "Invalid value.");
            }
        }
        log.warn("demo-request rejected reason=VALIDATION_ERROR fields={}", fieldErrors.keySet());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE, fieldErrors));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimit(RateLimitExceededException ex) {
        log.warn("demo-request rejected reason=RATE_LIMITED");
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponse("RATE_LIMITED", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleIdempotencyConflict(IdempotencyConflictException ex) {
        log.warn("project-enquiry rejected reason=IDEMPOTENCY_CONFLICT");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("IDEMPOTENCY_CONFLICT", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(RecruitmentIdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleRecruitmentIdempotencyConflict(RecruitmentIdempotencyConflictException ex) {
        log.warn("job-application rejected reason=IDEMPOTENCY_CONFLICT");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("IDEMPOTENCY_CONFLICT", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(ContactIdempotencyConflictException.class)
    public ResponseEntity<ErrorResponse> handleContactIdempotencyConflict(ContactIdempotencyConflictException ex) {
        log.warn("contact-message rejected reason=IDEMPOTENCY_CONFLICT");
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("IDEMPOTENCY_CONFLICT", ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(RecruitmentValidationException.class)
    public ResponseEntity<ErrorResponse> handleRecruitmentValidation(RecruitmentValidationException ex) {
        log.warn("job-application rejected reason=VALIDATION_ERROR fields={}", ex.fieldErrors().keySet());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE, ex.fieldErrors()));
    }

    @ExceptionHandler(UnknownOrClosedJobException.class)
    public ResponseEntity<ErrorResponse> handleUnknownOrClosedJob(UnknownOrClosedJobException ex) {
        log.warn("job-application rejected reason=UNKNOWN_OR_CLOSED_JOB");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE, Map.of("jobSlug", ex.getMessage())));
    }

    @ExceptionHandler(InvalidResumeException.class)
    public ResponseEntity<ErrorResponse> handleInvalidResume(InvalidResumeException ex) {
        log.warn("job-application rejected reason=INVALID_RESUME");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE, Map.of("resume", ex.getMessage())));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        log.warn("job-application rejected reason=UPLOAD_TOO_LARGE");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("VALIDATION_ERROR", GENERIC_VALIDATION_MESSAGE,
                        Map.of("resume", "Resume file is too large.")));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("demo-request failed reason=INTERNAL_ERROR", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "Something went wrong. Please try again shortly.", Map.of()));
    }
}
