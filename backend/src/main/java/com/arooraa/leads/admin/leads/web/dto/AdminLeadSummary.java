package com.arooraa.leads.admin.leads.web.dto;

import com.arooraa.leads.admin.leads.domain.LeadType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminLeadSummary(
        UUID id,
        LeadType leadType,
        String referenceNumber,
        String customerName,
        String companyOrRestaurant,
        String email,
        String phone,
        String cityOrCountry,
        String status,
        Instant createdAt,
        Instant followUpAt,
        String assignedTo,
        BigDecimal estimatedValue,
        String estimatedValueCurrency
) {
}
