package com.arooraa.leads.project.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidInternationalPhoneValidator.class)
public @interface ValidInternationalPhone {

    String message() default "Enter a valid phone number, including country code.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
