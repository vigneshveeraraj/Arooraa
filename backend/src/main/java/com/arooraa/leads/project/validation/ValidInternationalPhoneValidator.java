package com.arooraa.leads.project.validation;

import com.arooraa.leads.project.service.InternationalPhoneNormalizer;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidInternationalPhoneValidator implements ConstraintValidator<ValidInternationalPhone, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return false;
        }
        return InternationalPhoneNormalizer.isValid(value);
    }
}
