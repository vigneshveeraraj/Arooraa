package com.arooraa.leads.admin.leads.web.dto;

import java.math.BigDecimal;

public record EstimatedValueUpdateRequest(
        BigDecimal estimatedValue,
        String currency,
        Long expectedVersion
) {
}
