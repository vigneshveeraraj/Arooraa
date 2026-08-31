package com.arooraa.leads.project.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Class-level constraint enforcing which fields are required, conditional on
 * {@code submissionVersion} — see {@link ValidProjectEnquiryRequestValidator}.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidProjectEnquiryRequestValidator.class)
public @interface ValidProjectEnquiryRequest {

    String message() default "Please correct the highlighted fields.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
