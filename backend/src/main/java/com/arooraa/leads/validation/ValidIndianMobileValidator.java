package com.arooraa.leads.validation;

import com.arooraa.leads.service.PhoneNumberNormalizer;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidIndianMobileValidator implements ConstraintValidator<ValidIndianMobile, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return false;
        }
        return PhoneNumberNormalizer.isValid(value);
    }
}
