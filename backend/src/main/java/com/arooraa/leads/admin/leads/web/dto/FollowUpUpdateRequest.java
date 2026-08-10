package com.arooraa.leads.admin.leads.web.dto;

import java.time.Instant;

public record FollowUpUpdateRequest(
        Instant followUpAt,
        Long expectedVersion
) {
}
