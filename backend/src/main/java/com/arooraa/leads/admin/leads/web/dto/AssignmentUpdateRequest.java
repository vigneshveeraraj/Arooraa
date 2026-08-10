package com.arooraa.leads.admin.leads.web.dto;

import java.util.UUID;

public record AssignmentUpdateRequest(
        UUID assignedAdminId,
        Long expectedVersion
) {
}
