package com.arooraa.leads.admin.leads.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoteCreateRequest(
        @NotBlank @Size(max = 4000) String note
) {
}
