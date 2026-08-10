package com.arooraa.leads.admin.leads.web.dto;

import java.time.Instant;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String adminName,
        String note,
        Instant createdAt
) {
}
