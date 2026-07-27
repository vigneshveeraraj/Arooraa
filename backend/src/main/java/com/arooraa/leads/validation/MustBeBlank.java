package com.arooraa.leads.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a honeypot field: real users never populate it, so any value fails validation.
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MustBeBlankValidator.class)
public @interface MustBeBlank {

    String message() default "Invalid submission.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
