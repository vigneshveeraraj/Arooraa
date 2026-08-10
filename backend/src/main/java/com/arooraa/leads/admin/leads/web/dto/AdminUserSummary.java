package com.arooraa.leads.admin.leads.web.dto;

import java.util.UUID;

public record AdminUserSummary(
        UUID id,
        String email,
        String displayName
) {
}
