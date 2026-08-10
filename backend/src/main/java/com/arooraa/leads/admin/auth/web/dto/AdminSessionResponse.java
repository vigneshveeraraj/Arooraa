package com.arooraa.leads.admin.auth.web.dto;

import java.util.UUID;

public record AdminSessionResponse(
        UUID id,
        String email,
        String displayName
) {
}
