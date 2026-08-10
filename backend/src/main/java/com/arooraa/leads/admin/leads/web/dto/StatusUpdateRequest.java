package com.arooraa.leads.admin.leads.web.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusUpdateRequest(
        @NotBlank String status,
        String lostReason,
        Long expectedVersion
) {
}
