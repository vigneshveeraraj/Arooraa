package com.arooraa.leads.admin.leads.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ManagementInfo(
        UUID assignedAdminId,
        String assignedAdminName,
        Instant followUpAt,
        BigDecimal estimatedValue,
        String estimatedValueCurrency,
        String lostReason,
        String internalSummary,
        Instant lastContactedAt,
        long version
) {
}
