package com.arooraa.leads.admin.leads.web.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        String actorName,
        String activityType,
        String oldValue,
        String newValue,
        Instant createdAt
) {
}
