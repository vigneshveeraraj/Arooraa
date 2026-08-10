package com.arooraa.leads.admin.leads.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record EstimatedValueUpdateRequest(
        @DecimalMin(value = "0", message = "Estimated value cannot be negative.")
        @Digits(integer = 12, fraction = 2, message = "Estimated value has too many digits.")
        BigDecimal estimatedValue,
        @Size(max = 3, message = "Currency must be a 3-letter code.")
        String currency,
        Long expectedVersion
) {
}
